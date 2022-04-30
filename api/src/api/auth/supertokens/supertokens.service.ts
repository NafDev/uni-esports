import { Inject, Injectable } from '@nestjs/common';
import supertokens from 'supertokens-node';
import { PrismaService } from '../../../db/prisma/prisma.service';
import { AuthModuleConfig, ConfigInjectionToken } from '../config.interface';
import { STEmailVerification, STSession } from './supertokens.types';

@Injectable()
export class SupertokensService {
  constructor(
    @Inject(ConfigInjectionToken) private readonly config: AuthModuleConfig,
    private readonly prisma: PrismaService,
  ) {
    supertokens.init({
      appInfo: this.config.appInfo,
      supertokens: { connectionURI: config.connectionURI },
      recipeList: [
        STSession.init({ antiCsrf: 'NONE', cookieSameSite: 'strict' }),
        STEmailVerification.init({
          getEmailForUserId: async (userId) =>
            (await this.prisma.user.findFirst({ where: { uid: userId }, select: { email: true } })).email,
        }),
      ],
    });
  }
}
