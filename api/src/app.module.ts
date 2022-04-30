import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { AdminModule } from './api/admin/admin.module';
import { AuthModule } from './api/auth/auth.module';
import { UserModule } from './api/users/user.module';
import { AppConfigModule } from './config/config.module';
import { validate } from './config/config.service';
import { DatabaseModule } from './db/db.module';
import { PrismaService } from './db/prisma/prisma.service';
import { EmailModule } from './email/email.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: process.env['NODE_ENV'] === 'production' ? 'production.env' : 'development.env',
      cache: true,
      expandVariables: true,
      validate,
      isGlobal: true,
    }),
    AppConfigModule,
    LoggerModule.forRootAsync({
      useFactory() {
        return {
          pinoHttp: {
            transport: { target: 'pino-pretty' },
            redact: { paths: ['req.headers.cookie', 'res.headers["set-cookie"]'], remove: true },
          },
        };
      },
    }),
    AuthModule.forRoot({
      // https://supertokens.com/docs/session/appinfo
      // These variables should by now be validated and initialised in config.service.ts
      connectionURI: process.env['SESSION_TOKENS_API_DOMAIN'],
      appInfo: {
        appName: process.env['APP_NAME'],
        apiDomain: process.env['API_DOMAIN'],
        websiteDomain: process.env['WEB_DOMAIN'],
      },
    }),
    DatabaseModule,
    UserModule,
    EmailModule,
    AdminModule,
  ],
  providers: [PrismaService],
})
export class AppModule {}
