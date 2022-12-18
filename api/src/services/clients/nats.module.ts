import { Global, Module } from '@nestjs/common';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';
import appConfig from '../../config/app.config';
import { NatsClientInjectionToken, NatsService } from './nats.service';

@Global()
@Module({
	providers: [
		{
			provide: NatsClientInjectionToken,
			useFactory() {
				return ClientProxyFactory.create({
					transport: Transport.NATS,
					options: {
						servers: appConfig.NATS_SERVER_URL
					}
				});
			}
		},
		NatsService
	],
	exports: [NatsService]
})
export class NatsModule {}
