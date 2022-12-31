import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { LoggerModule } from 'nestjs-pino';
import { AdminModule } from './api/admin/admin.module';
import { AuthModule } from './api/auth/auth.module';
import { GameModule } from './api/games/games.module';
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
						redact: {
							paths: [
								'req.headers.cookie',
								'res.headers["set-cookie"]',
								'res.headers["content-security-policy"]',
								'res.headers["cross-origin-embedder-policy"]',
								'res.headers["cross-origin-opener-policy"]',
								'res.headers["cross-origin-resource-policy"]',
								'res.headers["x-dns-prefetch-control"]',
								'res.headers["expect-ct"]',
								'res.headers["x-frame-options"]',
								'res.headers["strict-transport-security"]',
								'res.headers["x-download-options"]',
								'res.headers["x-content-type-options"]',
								'res.headers["origin-agent-cluster"]',
								'res.headers["x-permitted-cross-domain-policies"]',
								'res.headers["referrer-policy"]',
								'res.headers["x-xss-protection"]',
								'res.headers["access-control-allow-origin"]',
								'res.headers.vary',
								'res.headers["access-control-allow-credentials"]',
								'res.headers["x-ratelimit-limit"]',
								'res.headers["x-ratelimit-remaining"]',
								'res.headers["x-ratelimit-reset"]',
								'res.headers["content-type"]'
							],
							remove: true
						}
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
		MatchSchedulingModule,
		GameModule
	],
	providers: [PrismaService, { provide: APP_GUARD, useClass: ThrottlerGuard }],
	controllers: [AppController]
})
export class AppModule {}
