import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import type { IUserDetails, IUsers, Pagination } from '@uni-esports/interfaces';
import type { SessionContainer } from 'supertokens-node/recipe/session';
import { WEB_EMAIL_VERIFY } from '../../../config/app.config';
import { PrismaService } from '../../../db/prisma/prisma.service';
import { AuthService } from '../../auth/auth.service';
import { STEmailVerification } from '../../auth/supertokens/supertokens.types';
import type { UserFiltersDto } from './users.admin.dto';

@Injectable()
export class UserService {
	private readonly logger = new Logger(UserService.name);

	constructor(private readonly prisma: PrismaService, private readonly authService: AuthService) {}

	async findAllUsers(page: number, filters: UserFiltersDto): Promise<Pagination<IUsers>> {
		page = page < 1 ? 1 : page;

		const where = {
			email: filters.email ? { startsWith: filters.email.toLowerCase() } : undefined,
			username: filters.username ? { startsWith: filters.username } : undefined
		};

		const resp = await this.prisma.$transaction([
			this.prisma.user.count({ where }),
			this.prisma.user.findMany({
				where,
				select: { id: true, email: true, username: true },
				take: 20,
				skip: 20 * (page - 1)
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
				University: { select: { name: true } }
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
		const user = await this.prisma.user.update({
			where: { id: userId },
			data: { email, verified: false },
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
