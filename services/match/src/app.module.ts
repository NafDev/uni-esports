import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { OgmaInterceptor, OgmaModule } from '@ogma/nestjs-module';
import { AuthModule } from './auth/auth.module';
import { OgmaModuleConfig } from './common/logger-module-config';
import { DatabaseModule } from './db/db.module';
import { NatsModule } from './services/clients/nats.module';
import { MatchOrchestrationModule } from './services/match-orchestration/match-orchestration.module';
import { MatchSchedulingModule } from './services/match-scheduling/match-scheduling.module';
import { VetoModule } from './services/veto/veto.module';

@Module({
	imports: [
		OgmaModule.forRoot(OgmaModuleConfig.createModuleConfig()),
		ScheduleModule.forRoot(),
		DatabaseModule,
		NatsModule,
		MatchSchedulingModule,
		VetoModule,
		MatchOrchestrationModule,
		AuthModule
	],
	controllers: [],
	providers: [
		{
			provide: APP_INTERCEPTOR,
			useClass: OgmaInterceptor
		}
	]
})
export class AppModule {}
