import { createWriteStream, writeFileSync, type WriteStream } from 'node:fs';
import { stdout } from 'node:process';
import type { OgmaModuleOptions } from '@ogma/nestjs-module';
import { NatsParser } from '@ogma/platform-nats';
import appConfig from '../config/app.config';

let logFileStream: WriteStream;

function getLogFileStream() {
	if (logFileStream) {
		return logFileStream;
	}

	const logFile = `logs/${Date.now()}.log`;
	writeFileSync(logFile, '');

	logFileStream = createWriteStream(logFile, 'utf8');

	return logFileStream;
}

export const OgmaModuleConfig = {
	createModuleConfig(): OgmaModuleOptions {
		return {
			service: {
				application: 'uni-esports-api-service',
				color: appConfig.isDev,
				json: appConfig.isProd,
				stream: {
					write(message: unknown) {
						stdout.write(message as string);

						if (!appConfig.isDev) {
							getLogFileStream().write(message);
						}
					}
				},
				logPid: true,
				logApplication: appConfig.isProd,
				logLevel: appConfig.isProd ? 'INFO' : 'ALL',
				logHostname: appConfig.isProd
			},
			interceptor: {
				rpc: NatsParser
			}
		};
	}
};
