import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { LoggerService } from '../../common/logger-wrapper';

export const NatsClientInjectionToken = 'MATCH_SERVICE';

@Injectable()
export class NatsService {
	private readonly logger = new LoggerService(NatsService.name);

	constructor(@Inject(NatsClientInjectionToken) readonly client: ClientProxy) {}

	send<T>(pattern: string, data: any, excludeDataFromLog = false) {
		this.logger.log('Publishing request', {
			pattern,
			data: excludeDataFromLog ? undefined : data
		});
		return this.client.send<T>(pattern, data);
	}

	emit<T>(pattern: string, data: any, excludeDataFromLog = false) {
		this.logger.log('Publishing event', {
			pattern,
			data: excludeDataFromLog ? undefined : data
		});
		return this.client.emit<T>(pattern, data);
	}
}
