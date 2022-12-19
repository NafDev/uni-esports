import { Logger } from '@nestjs/common';

type Log = [message: string, metadata?: Record<string, any>];

export class LoggerService {
	private readonly nestLogger: Logger;

	constructor(context: string) {
		this.nestLogger = new Logger(context);
	}

	verbose(..._parameters: Log) {
		this.nestLogger.verbose({ msg: _parameters[0], metadata: _parameters[1] });
	}

	debug(..._parameters: Log) {
		this.nestLogger.debug({ msg: _parameters[0], metadata: _parameters[1] });
	}

	log(..._parameters: Log) {
		this.nestLogger.log({ msg: _parameters[0], metadata: _parameters[1] });
	}

	warn(..._parameters: Log) {
		this.nestLogger.warn({ msg: _parameters[0], metadata: _parameters[1] });
	}

	error(message: string, metadata?: Record<string, any>, stack?: string) {
		this.nestLogger.error({ msg: message, metadata }, stack);
	}
}
