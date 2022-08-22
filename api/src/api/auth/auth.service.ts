import {
	BadRequestException,
	Injectable,
	InternalServerErrorException,
	Logger,
	UnauthorizedException
} from '@nestjs/common';
import type { AccessTokenPayload, INewPasswordDto } from '@uni-esports/interfaces';
import axios from 'axios';
import { compare, hash } from 'bcrypt';
import type { Response } from 'express';
import type { SessionContainer } from 'supertokens-node/recipe/session';
import appConfig from '../../config/app.config';
import { classifyPrismaError, PrismaError } from '../../db/prisma/prisma.errors';
import { PrismaService } from '../../db/prisma/prisma.service';
import { EmailTemplates, SmtpService } from '../../email/smtp.service';
import { createToken, sha265hex } from '../../util/utility';
import type { UserLoginDto } from '../users/users.dto';
import { steamOpenId, SteamOpenIdParameters } from './openid/steam.openid';
import { STSession } from './supertokens/supertokens.types';

@Injectable()
export class AuthService {
	private readonly logger = new Logger(AuthService.name);

	constructor(private readonly prisma: PrismaService, private readonly smtpService: SmtpService) {}

	async login(userLoginDto: UserLoginDto, resp: Response) {
		const user = await this.prisma.user.findUnique({
			where: { email: userLoginDto.email.toLowerCase() },
			select: { id: true, passwordHash: true, roles: true, email: true, verified: true }
		});

		if (user !== null && user.passwordHash === null) {
			throw new BadRequestException('Please reset your password');
		}

		if (user !== null && (await compare(userLoginDto.password, user.passwordHash ?? ''))) {
			const payload: AccessTokenPayload = {
				roles: user.roles,
				pendingEmailVerification: user.verified ? undefined : true
			};

			await STSession.createNewSession(resp, user.id, payload);
			return;
		}

		throw new UnauthorizedException('Invalid email or password');
	}

	async logout(session: SessionContainer) {
		await session.revokeSession();
	}

	async sendPasswordResetTokenEmail(email: string) {
		const token = createToken();
		const timeLimitedToken = `${sha265hex(token)}#${(
			Date.now() +
			appConfig.PASSWORD_RESET_EXPIRY_MINS * 60_000
		).toString()}`;

		let user;
		try {
			user = await this.prisma.user.update({
				where: { email },
				data: { passwordResetToken: timeLimitedToken },
				select: { email: true, id: true }
			});
		} catch (error: unknown) {
			const [type] = classifyPrismaError(error);
			if (type === PrismaError.NOT_FOUND) {
				return;
			}

			throw error;
		}

		if (user) {
			await this.smtpService.sendEmail(email, 'Reset your password', EmailTemplates.RESET_PASSWORD, {
				link: `${appConfig.WEB_DOMAIN}/user/reset-password?token=${token}`
			});
		}

		this.logger.log(`User ${user.email} requested password reset`);
	}

	async performPasswordReset(token: string, newPassword: string) {
		const user = await this.prisma.user.findFirst({ where: { passwordResetToken: { startsWith: sha265hex(token) } } });

		if (user === null || Number.parseInt(user.passwordResetToken?.split('#').at(1) ?? '0', 10) <= Date.now()) {
			throw new UnauthorizedException('Invalid token. It may have expired.');
		}

		await STSession.revokeAllSessionsForUser(user.id);

		await this.prisma.user.update({
			where: { id: user.id },
			data: { passwordHash: await hash(newPassword, appConfig.PASSWORD_SALT_ROUNDS), passwordResetToken: null }
		});

		this.logger.log(`User ${user.id} successfully performed password reset`);
	}

	async performChangePasswordRequest(session: SessionContainer, body: INewPasswordDto) {
		const { oldPassword, password } = body;
		const id = session.getUserId();

		const user = await this.prisma.user.findUnique({
			where: { id },
			select: { id: true, passwordHash: true }
		});

		if (!user) {
			this.logger.error(`Unexpected not found user ${id}`);
			throw new InternalServerErrorException();
		}

		if (!(await compare(oldPassword, user.passwordHash ?? ''))) {
			throw new UnauthorizedException('Old password is invalid');
		}

		await this.prisma.user.update({
			where: { id },
			data: { passwordHash: await hash(password, appConfig.PASSWORD_SALT_ROUNDS) },
			select: { id: true }
		});

		const currentSession = session.getHandle();
		const sessions = await STSession.getAllSessionHandlesForUser(id);

		await STSession.revokeMultipleSessions(sessions.filter((handle) => handle !== currentSession));
	}

	async performSteamAccountLink(steamOidResponse: Required<SteamOpenIdParameters>, session: SessionContainer) {
		const id = session.getUserId();

		const resp = await axios.get<string>(steamOpenId.authVerifyUrl(steamOidResponse));

		if (!steamOpenId.evaluateAuthResponse(resp.data)) {
			throw new UnauthorizedException('Could not verify your account');
		}

		const steam64Id = steamOpenId.stripClaimedId(steamOidResponse['openid.claimed_id']);

		try {
			await this.prisma.user.update({ where: { id }, data: { steam64Id }, select: { id: true } });

			return { steam64Id };
		} catch (error: unknown) {
			const [prismaError] = classifyPrismaError(error);
			if (prismaError === PrismaError.CONSTRAINT_FAILED) {
				throw new BadRequestException('This Steam account cannot be linked');
			}

			throw error;
		}
	}
}
