import { Body, Controller, Get, Param, Post, Session, UseGuards } from '@nestjs/common';
import { IPasswordResetDto } from '@uniesports/types';
import { SessionContainer } from 'supertokens-node/recipe/session';
import { AuthGuard } from '../auth/auth.guard';
import { SteamOpenIdParams } from '../auth/steamoid/steam.openid';
import { CreateUserDto, EmailDto, NewPasswordDto } from './user.dto';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  /// @UseGuards(AuthGuard)
  /// async getUser(@Session() session: SessionContainer) {
  async getUser() {
    throw new Error('Yo');
    /// return this.userService.getUserInfo(session.getUserId());
  }

  @Post('create')
  async createUser(@Body() createUserDto: CreateUserDto) {
    return this.userService.createPlayerUser(createUserDto);
  }

  @Post('link/steam')
  @UseGuards(AuthGuard)
  async linkSteamId(@Session() session: SessionContainer, @Body() openIdParams: SteamOpenIdParams) {
    return this.userService.linkSteamId(openIdParams, session.getUserId());
  }

  @Post('email/verify')
  async sendVerificationEmail(@Body() email: EmailDto) {
    return this.userService.sendVerificationEmail(email);
  }

  @Get('email/verify/:token')
  async verifyUserEmail(@Param('token') token: string) {
    return this.userService.verifyUserEmail(token);
  }

  @Post('password/change')
  @UseGuards(AuthGuard)
  async changePassword(@Session() session: SessionContainer, @Body() passwordDto: NewPasswordDto) {
    return this.userService.performKnownPasswordReset(
      session.getUserId(),
      passwordDto.oldPassword,
      passwordDto.password,
    );
  }

  @Post('password/reset')
  async requestPasswordReset(@Body() emailDto: EmailDto) {
    return this.userService.requestPasswordReset(emailDto.email);
  }

  @Post('password/reset/token')
  async performPasswordReset(@Body() passwdResetDto: IPasswordResetDto) {
    return this.userService.performPasswordReset(passwdResetDto.token, passwdResetDto.password);
  }
}
