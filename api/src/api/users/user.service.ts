import { BadRequestException, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { IUserInfoDto, Roles } from '@uniesports/types';
import axios from 'axios';
import { compare, hash } from 'bcrypt';
import dayjs from 'dayjs';
import { AppConfig } from '../../config/config.service';
import { PrismaService } from '../../db/prisma/prisma.service';
import { EmailTemplates, SmtpService } from '../../email/smtp.service';
import { nanoDbId, passwordResetToken } from '../../util/nanoid';
import {
  evaluateSteamOidResponse,
  steamAuthenticationVerifyUrl,
  steamIdFromClaimedIdParam,
  SteamOpenIdParams,
} from '../auth/steamoid/steam.openid';
import { STEmailVerification, STSession } from '../auth/supertokens/supertokens.types';
import { CreateUserDto } from './user.dto';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    private readonly appConfig: AppConfig,
    private readonly prisma: PrismaService,
    private readonly smtpService: SmtpService,
  ) {}

  async createPlayerUser(createUserDto: CreateUserDto) {
    const domain = createUserDto.email.split('@')[1];
    const uni = await this.prisma.emailDomain.findFirst({ where: { domain }, select: { universityId: true } });

    if (!uni) {
      this.logger.log(`Attempted player signup of unknown domain "${domain}"`);
      throw new BadRequestException('Unable to find your university. Please contact support.');
    }

    const user = await this.prisma.user.create({
      data: {
        uid: nanoDbId(),
        email: createUserDto.email.toLowerCase(),
        passwordHash: await hash(createUserDto.password, this.appConfig.passwordSaltRounds),
        universityId: uni.universityId,
      },
    });

    await this.prisma.userRoles.create({
      data: {
        userId: user.id,
        roleId: Roles.PLAYER,
      },
    });

    await this.sendVerificationEmail({ uid: user.uid, email: user.email });

    return { email: user.email };
  }

  async sendVerificationEmail(userInfo: Partial<IUserInfoDto>) {
    if (!userInfo.uid && !userInfo.email) {
      throw new BadRequestException('No valid properties');
    }

    const user = await this.prisma.user.findFirst({ where: { OR: { email: userInfo.email, uid: userInfo.uid } } });
    if (!user) {
      throw new BadRequestException('Invalid account details');
    }

    await STEmailVerification.revokeEmailVerificationTokens(user.uid, user.email);

    const verifyToken = await STEmailVerification.createEmailVerificationToken(user.uid, user.email);

    if (verifyToken.status === 'OK') {
      const verifyLink = this.appConfig.webDomain + `/verify/${verifyToken.token}`;
      await this.smtpService.sendEmail(user.email, 'Verify your email address', EmailTemplates.VERIFY_USER, {
        verifyLink,
      });
    }
  }

  async verifyUserEmail(token: string) {
    const res = await STEmailVerification.verifyEmailUsingToken(token);
    if (res.status !== 'OK') {
      throw new UnauthorizedException('Invalid verification token');
    }

    await this.prisma.user.update({ where: { uid: res.user.id }, data: { verified: true } });
  }

  async requestPasswordReset(email: string) {
    await this.prisma.user.update({
      where: { email },
      data: {
        passwordResetToken: passwordResetToken(),
        passwordResetExpiry: dayjs().add(this.appConfig.passwordResetExpiryMins, 'm').toDate(),
      },
    });
  }

  async performPasswordReset(passwordResetToken: string, newPassword: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        passwordResetToken,
        passwordResetExpiry: { gte: new Date() },
      },
      select: { id: true, uid: true },
    });

    if (!user) {
      throw new BadRequestException('This link has expired. Please request a new password reset email.');
    }

    await STSession.revokeAllSessionsForUser(user.uid);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: await hash(newPassword, this.appConfig.passwordSaltRounds),
        passwordResetToken: null,
        passwordResetExpiry: null,
      },
    });
  }

  async performKnownPasswordReset(uid: string, oldPassword: string, newPassword: string) {
    const user = await this.prisma.user.findFirst({ where: { uid }, select: { id: true, passwordHash: true } });

    if (!user && !(await compare(oldPassword, user.passwordHash))) {
      throw new UnauthorizedException('Invalid password. Please ensure your current password is correct.');
    }

    await STSession.revokeAllSessionsForUser(uid);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: await hash(newPassword, this.appConfig.passwordSaltRounds) },
    });
  }

  async linkSteamId(openIdParams: SteamOpenIdParams, uid: string) {
    const res = await axios.get(steamAuthenticationVerifyUrl(openIdParams));

    if (!evaluateSteamOidResponse(res.data)) {
      throw new UnauthorizedException('Invalid parameters');
    }

    const steam64Id = steamIdFromClaimedIdParam(openIdParams['openid.claimed_id']);

    await this.prisma.user.update({ where: { uid }, data: { steam64Id } });

    return { steam64Id };
  }

  async getUserInfo(uid: string): Promise<IUserInfoDto> {
    return this.prisma.user.findFirst({ where: { uid }, select: { email: true, uid: true } });
  }
}
