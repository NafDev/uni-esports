import { Global, Module } from '@nestjs/common';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';
import appConfig from '../../config/app.config';

export const NatsClientInjectionToken = 'NATS';

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
		}
	],
	exports: [NatsClientInjectionToken]
})
export class NatsModule {}
