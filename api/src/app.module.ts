import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { LoggerModule } from 'nestjs-pino';
import { AdminModule } from './api/admin/admin.module';
import { AuthModule } from './api/auth/auth.module';
import { TeamModule } from './api/teams/teams.module';
import { UniversityModule } from './api/universities/uni.module';
import { UserModule } from './api/users/users.module';
import { AppController } from './app.controller';
import { DatabaseModule } from './db/db.module';
import { PrismaService } from './db/prisma/prisma.service';
import { EmailModule } from './email/email.module';
import { NatsModule } from './services/clients/nats.module';
import { MatchSchedulingModule } from './services/match-scheduling/match-scheduling.module';

@Module({
	imports: [
		LoggerModule.forRootAsync({
			useFactory() {
				return {
					pinoHttp: {
						transport: { target: 'pino-pretty' },
						redact: { paths: ['req.headers.cookie', 'res.headers["set-cookie"]'], remove: true }
					}
				};
			}
		}),
		ThrottlerModule.forRoot({
			ttl: 60,
			limit: 100
		}),
		NatsModule,
		AuthModule,
		DatabaseModule,
		UserModule,
		TeamModule,
		UniversityModule,
		EmailModule,
		AdminModule,
		MatchSchedulingModule
	],
	providers: [PrismaService, { provide: APP_GUARD, useClass: ThrottlerGuard }],
	controllers: [AppController]
})
export class AppModule {}
