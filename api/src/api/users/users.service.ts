import { BadRequestException, ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import type { AccessTokenPayload } from '@uni-esports/interfaces';
import { hash } from 'bcrypt';
import type { SessionContainer } from 'supertokens-node/recipe/session';
import appConfig, { emailVerificationUrl } from '../../config/app.config';
import { classifyPrismaError, normalizeConflictError, PrismaError } from '../../db/prisma/prisma.errors';
import { PrismaService } from '../../db/prisma/prisma.service';
import { EmailTemplates, SmtpService } from '../../email/smtp.service';
import { STEmailVerification } from '../auth/supertokens/supertokens.types';
import type { CreateUserDto, UserInfoDto } from './users.dto';

@Injectable()
export class UserService {
	private readonly logger = new Logger(UserService.name);

	constructor(private readonly prisma: PrismaService, private readonly smtpService: SmtpService) {}

	async createUser(createUserDto: CreateUserDto) {
		const emailDomain = createUserDto.email.split('@').at(1);

		if (emailDomain === undefined) {
			throw new BadRequestException('Unknown university email domain');
		}

		const uni = await this.prisma.universityDomain.findUnique({
			where: { domain: emailDomain },
			select: { universityId: true }
		});

		if (uni === null) {
			throw new BadRequestException('Unknown university email domain');
		}

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
				emailVerifyLink: `${emailVerificationUrl}?token=${verificationToken.token}`,
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
	}

	async getUserInfo(session: SessionContainer): Promise<UserInfoDto> {
		const user = await this.prisma.user.findUnique({
			where: { id: session.getUserId() },
			select: { email: true, id: true, University: true, roles: true, verified: true }
		});

		if (!user) throw new NotFoundException('User not found');

		const updatedPayload: AccessTokenPayload = {
			roles: user.roles,
			pendingEmailVerification: user.verified ? undefined : true
		};

		await session.updateAccessTokenPayload(updatedPayload);

		return {
			id: user.id,
			email: user.email
		};
	}
}
