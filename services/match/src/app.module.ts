import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { LoggerModule } from 'nestjs-pino';
import { DatabaseModule } from './db/db.module';
import { NatsModule } from './services/clients/nats.module';
import { MatchSchedulingModule } from './services/scheduling/match-scheduling.module';

@Module({
	imports: [
		LoggerModule.forRootAsync({
			useFactory() {
				return {
					pinoHttp: {
						transport: { target: 'pino-pretty' }
					}
				};
			}
		}),
		ScheduleModule.forRoot(),
		DatabaseModule,
		NatsModule,
		MatchSchedulingModule
	],
	controllers: [],
	providers: []
})
export class AppModule {}
