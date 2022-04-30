import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { AccessTokenPayload } from '@uniesports/types';
import { compare } from 'bcrypt';
import { SessionContainer } from 'supertokens-node/recipe/session';
import { PrismaService } from '../../db/prisma/prisma.service';
import { UserLoginDto } from '../users/user.dto';
import { STSession } from './supertokens/supertokens.types';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(private readonly prisma: PrismaService) {}

  async login(userLoginDto: UserLoginDto, res: any) {
    const user = await this.prisma.user.findFirst({
      where: { email: userLoginDto.email.toLowerCase() },
      select: { uid: true, passwordHash: true, UserRoles: true },
    });

    if (user !== null && (await compare(userLoginDto.password, user.passwordHash))) {
      const payload: AccessTokenPayload = {
        roles: user.UserRoles.map((role) => role.roleId),
      };

      await STSession.createNewSession(res, user.uid, payload);
      return;
    }

    this.logger.log(`Invalid password for user ${user.uid}`);
    throw new UnauthorizedException('Invalid email or password');
  }

  async logout(session: SessionContainer) {
    await session.revokeSession();
  }
}
