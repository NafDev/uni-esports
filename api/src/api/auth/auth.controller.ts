import { Body, Controller, Get, Post, Res, Session, UseGuards } from '@nestjs/common';
import type { INewPasswordDto } from '@uni-esports/interfaces';
import type { Response } from 'express';
import type { SessionContainer } from 'supertokens-node/recipe/session';
import { EmailDto, PasswordDto, UserLoginDto } from '../users/users.dto';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';

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

	@Post('password/reset')
	async resetPassword(@Body() emailDto: EmailDto) {
		void this.authService.sendPasswordResetTokenEmail(emailDto.email);
	}

	@Post('password/reset/token')
	async performPasswordReset(@Body() passwordResetDto: PasswordDto) {
		const { token, password } = passwordResetDto;
		return this.authService.performPasswordReset(token, password);
	}

	@Post('password/change')
	@UseGuards(AuthGuard)
	async performPasswordChange(@Body() passwordChangeDto: INewPasswordDto, @Session() session: SessionContainer) {
		return this.authService.performChangePasswordRequest(session, passwordChangeDto);
	}
}
