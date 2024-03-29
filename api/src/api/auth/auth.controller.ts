import { Body, Controller, Get, Post, Res, Session, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { Response } from 'express';
import type { SessionContainer } from 'supertokens-node/recipe/session';
import { VerifiedGuard } from '../../common/guards/user/verified.guard';
import appConfig, { WEB_STEAM_REDIRECT } from '../../config/app.config';
import { EmailDto, NewPasswordDto, PasswordDto, UserLoginDto } from '../users/users.dto';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { steamOpenId, SteamOpenIdParameters } from './openid/steam.openid';

@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Post('signin')
	async login(@Body() userLoginDto: UserLoginDto, @Res({ passthrough: true }) resp: Response): Promise<void> {
		return this.authService.login(userLoginDto, resp);
	}

	@Get('signout')
	@UseGuards(AuthGuard)
	async logout(@Session() session: SessionContainer) {
		return this.authService.logout(session);
	}

	// @Throttle(5, 120)
	@Post('password/reset')
	async resetPassword(@Body() emailDto: EmailDto) {
		return this.authService.sendPasswordResetTokenEmail(emailDto.email);
	}

	@Post('password/reset/token')
	async performPasswordReset(@Body() passwordResetDto: PasswordDto) {
		const { token, password } = passwordResetDto;
		return this.authService.performPasswordReset(token, password);
	}

	@Post('password/change')
	@UseGuards(AuthGuard)
	async performPasswordChange(@Body() passwordChangeDto: NewPasswordDto, @Session() session: SessionContainer) {
		return this.authService.performChangePasswordRequest(session, passwordChangeDto);
	}

	@Get('steam/redirect')
	@UseGuards(AuthGuard, VerifiedGuard)
	steamAuthRedirect() {
		return {
			url: steamOpenId.authRedirectUrl(`${WEB_STEAM_REDIRECT}`, appConfig.WEB_DOMAIN)
		};
	}

	@Post('steam/link')
	@UseGuards(AuthGuard, VerifiedGuard)
	async steamAuthLink(@Body() body: SteamOpenIdParameters, @Session() session: SessionContainer) {
		return this.authService.performSteamAccountLink(body, session);
	}
}
