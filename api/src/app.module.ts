import { Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { OgmaInterceptor, OgmaModule } from '@ogma/nestjs-module';
import { AdminModule } from './api/admin/admin.module';
import { AuthModule } from './api/auth/auth.module';
import { GameModule } from './api/games/games.module';
import { TeamModule } from './api/teams/teams.module';
import { UniversityModule } from './api/universities/uni.module';
import { UserModule } from './api/users/users.module';
import { WebhooksModule } from './api/webhooks/webhooks.module';
import { AppController } from './app.controller';
import { OgmaModuleConfig } from './common/logger-module-config';
import { DatabaseModule } from './db/db.module';
import { PrismaService } from './db/prisma/prisma.service';
import { EmailModule } from './email/email.module';
import { NatsModule } from './nats.module';
import { ScrimModule } from './api/scrim/scrim.module';

@Module({
	controllers: [AppController],
	imports: [
		OgmaModule.forRoot(OgmaModuleConfig.createModuleConfig()),
		ThrottlerModule.forRoot({ ttl: 60, limit: 100 }),
		AuthModule,
		NatsModule,
		DatabaseModule,
		UserModule,
		TeamModule,
		UniversityModule,
		EmailModule,
		AdminModule,
		GameModule,
		WebhooksModule,
		ScrimModule
	],
	providers: [
		PrismaService,
		{ provide: APP_GUARD, useClass: ThrottlerGuard },
		{
			provide: APP_INTERCEPTOR,
			useClass: OgmaInterceptor
		}
	]
})
export class AppModule {}
