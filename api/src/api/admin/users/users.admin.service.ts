import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import type { IUserDetails, IUsers, Pagination } from '@uni-esports/interfaces';
import type { SessionContainer } from 'supertokens-node/recipe/session';
import { WEB_EMAIL_VERIFY } from '../../../config/app.config';
import { PrismaService } from '../../../db/prisma/prisma.service';
import { prismaPaginationSkipTake } from '../../../util/utility';
import { AuthService } from '../../auth/auth.service';
import { STEmailVerification } from '../../auth/supertokens/supertokens.types';
import type { UserFiltersDto } from './users.admin.dto';

@Injectable()
export class UserService {
	private readonly logger = new Logger(UserService.name);

	constructor(private readonly prisma: PrismaService, private readonly authService: AuthService) {}

	async findAllUsers(page: number, filters: UserFiltersDto): Promise<Pagination<IUsers>> {
		page = page < 1 ? 1 : page;

		const where: Prisma.Enumerable<Prisma.UserWhereInput> = {
			email: filters.email ? { contains: filters.email.toLowerCase() } : undefined,
			username: filters.username ? { contains: filters.username } : undefined
		};

		const resp = await this.prisma.$transaction([
			this.prisma.user.count({ where }),
			this.prisma.user.findMany({
				where,
				select: { id: true, email: true, username: true },
				...prismaPaginationSkipTake(page)
			})
		]);

		return resp;
	}

	async findUser(id: string): Promise<IUserDetails> {
		const user = await this.prisma.user.findUnique({
			where: { id },
			select: {
				createdAt: true,
				discordId: true,
				steam64Id: true,
				email: true,
				username: true,
				id: true,
				verified: true,
				universityId: true
			}
		});

		if (!user) throw new NotFoundException();

		return user;
	}

	async sendPasswordReset(userId: string, session: SessionContainer) {
		const resp = await this.prisma.user.findUnique({
			where: { id: userId },
			select: { email: true }
		});

		if (resp) {
			await this.authService.sendPasswordResetTokenEmail(resp.email);
		}

		this.logger.log(`Admin ${session.getUserId()} requested password reset email for user ${userId}`);
	}

	async updateEmail(userId: string, email: string, session: SessionContainer) {
		const newDomain = email.toLowerCase().split('@').at(1);

		if (!newDomain) {
			throw new BadRequestException('Malformed email domain');
		}

		const newUni = await this.prisma.universityDomain.findFirst({
			where: { domain: newDomain },
			select: { universityId: true }
		});

		if (!newUni) {
			throw new BadRequestException("Couldn't find a university associated with provided email domain");
		}

		const user = await this.prisma.user.update({
			where: { id: userId },
			data: { email, verified: false, universityId: newUni.universityId },
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

		this.logger.log(`Admin ${session.getUserId()} changed email for user ${userId}`);
	}

	async updateUsername(userId: string, username: string, session: SessionContainer) {
		await this.prisma.user.update({
			where: { id: userId },
			data: { username },
			select: { id: true }
		});

		this.logger.log(`Admin ${session.getUserId()} changed username for user ${userId}`);
	}

	async unlinkSteamId(userId: string, session: SessionContainer) {
		await this.prisma.user.update({
			where: { id: userId },
			data: { steam64Id: null },
			select: { id: true }
		});

		this.logger.log(`Admin ${session.getUserId()} unlinked Steam ID for user ${userId}`);
	}
}
