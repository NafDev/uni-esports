import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { OgmaModule } from '@ogma/nestjs-module';
import appConfig from '../../config/app.config';
import { AuthModule } from '../auth/auth.module';
import { MatchModule } from '../matches/matches.module';
import { WebhooksController } from './webhooks.controller';

@Module({
	controllers: [WebhooksController],
	imports: [
		AuthModule,
		MatchModule,
		OgmaModule.forFeatures([WebhooksController]),
		ClientsModule.register([
			{ name: 'NATS', transport: Transport.NATS, options: { servers: appConfig.NATS_SERVER_URL } }
		])
	]
})
export class WebhooksModule {}
