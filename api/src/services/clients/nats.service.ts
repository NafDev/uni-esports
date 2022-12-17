import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

export const NatsClientInjectionToken = 'MATCH_SERVICE';

@Injectable()
export class NatsService {
	private readonly logger = new Logger(NatsService.name);

	constructor(@Inject(NatsClientInjectionToken) readonly client: ClientProxy) {}

	send<T>(pattern: string, data: any, excludeDataFromLog = false) {
		this.logger.log({
			msg: 'Publishing request',
			pattern,
			data: excludeDataFromLog ? undefined : data
		});
		return this.client.send<T>(pattern, data);
	}

	emit<T>(pattern: string, data: any, excludeDataFromLog = false) {
		this.logger.log({
			msg: 'Publishing event',
			pattern,
			data: excludeDataFromLog ? undefined : data
		});
		return this.client.emit<T>(pattern, data);
	}
}
