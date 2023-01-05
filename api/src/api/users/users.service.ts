import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { OgmaLogger, OgmaService } from '@ogma/nestjs-module';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import type { AccessTokenPayload } from '@uni-esports/interfaces';
import { hash } from 'bcrypt';
import type { SessionContainer } from 'supertokens-node/recipe/session';
import appConfig, { WEB_EMAIL_VERIFY } from '../../config/app.config';
import { classifyPrismaError, normalizeConflictError, PrismaError } from '../../db/prisma/prisma.errors';
import { PrismaService } from '../../db/prisma/prisma.service';
import { SmtpService } from '../../email/smtp.service';
import { STEmailVerification } from '../auth/supertokens/supertokens.types';
import type { CreateUserDto, UserInfoDto } from './users.dto';

@Injectable()
export class UserService {
	constructor(
		@OgmaLogger(UserService) private readonly logger: OgmaService,
		private readonly prisma: PrismaService,
		private readonly smtpService: SmtpService
	) {}

	async createUser(createUserDto: CreateUserDto) {
		const emailDomain = createUserDto.email.split('@').at(1);

		const uni = await this.prisma.universityDomain.findUnique({
			where: { domain: emailDomain ?? '' },
			select: { universityId: true }
		});

		if (uni === null) {
			throw new BadRequestException('Unknown university email domain');
		}

		let userId;

		try {
			const user = await this.prisma.user.create({
				data: {
					email: createUserDto.email.toLowerCase(),
					username: createUserDto.username,
					passwordHash: await hash(createUserDto.password, appConfig.PASSWORD_SALT_ROUNDS),
					roles: 'USER',
					universityId: uni.universityId
				},
				select: { id: true, email: true }
			});

			const verificationToken = await STEmailVerification.createEmailVerificationToken(user.id, user.email);
			if (verificationToken.status === 'EMAIL_ALREADY_VERIFIED_ERROR') {
				throw new Error('Email is already registered and verified');
			}

			await STEmailVerification.sendEmail({
				emailVerifyLink: `${WEB_EMAIL_VERIFY}?token=${verificationToken.token}`,
				user: {
					email: user.email,
					id: user.id
				},
				type: 'EMAIL_VERIFICATION',
				userContext: {}
			});
		} catch (error: unknown) {
			if (
				error instanceof PrismaClientKnownRequestError &&
				classifyPrismaError(error)[0] === PrismaError.CONSTRAINT_FAILED
			) {
				const message = normalizeConflictError(error);
				if (message) throw new ConflictException(message);
			}

			throw error;
		}

		this.logger.debug('User created', { userId });
	}

	async getUserInfo(session: SessionContainer): Promise<UserInfoDto> {
		const user = await this.prisma.user.findUnique({
			where: { id: session.getUserId() },
			select: {
				id: true,
				email: true,
				verified: true,
				username: true,
				roles: true,
				steam64Id: true,
				discordId: true,
				university: { select: { name: true } }
			}
		});

		if (!user) {
			this.logger.warn('User not found from session user ID', { userId: session.getUserId() });
			throw new NotFoundException('User not found');
		}

		const updatedPayload: AccessTokenPayload = {
			roles: user.roles,
			pendingEmailVerification: user.verified ? undefined : true
		};

		await session.updateAccessTokenPayload(updatedPayload);

		return {
			id: user.id,
			email: user.email,
			username: user.username,
			university: user.university?.name,
			steam64: user.steam64Id ?? undefined,
			discord: user.discordId ?? undefined
		};
	}
}
