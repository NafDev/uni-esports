import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { LoggerModule } from 'nestjs-pino';
import { DatabaseModule } from './db/db.module';
import { NatsModule } from './services/clients/nats.module';
import { MatchSchedulingModule } from './services/match-scheduling/match-scheduling.module';
import { VetoModule } from './services/veto/veto.module';
import { MatchOrchestrationModule } from './services/match-orchestration/match-orchestration.module';
import { AuthModule } from './auth/auth.module';

@Module({
	imports: [
		LoggerModule.forRootAsync({
			useFactory() {
				return {
					pinoHttp: {
						transport: { target: 'pino-pretty' },
						autoLogging: false
					}
				};
			}
		}),
		ScheduleModule.forRoot(),
		DatabaseModule,
		NatsModule,
		MatchSchedulingModule,
		VetoModule,
		MatchOrchestrationModule,
		AuthModule
	],
	controllers: [],
	providers: []
})
export class AppModule {}
