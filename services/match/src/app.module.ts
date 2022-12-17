import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { LoggerModule } from 'nestjs-pino';
import { DatabaseModule } from './db/db.module';
import { NatsModule } from './services/clients/nats.module';
import { SchedulingModule } from './services/scheduling/scheduling.module';

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
		SchedulingModule
	],
	controllers: [],
	providers: []
})
export class AppModule {}
