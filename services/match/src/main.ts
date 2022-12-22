import { Logger, LoggerErrorInterceptor } from 'nestjs-pino';
import { NestFactory } from '@nestjs/core';
import { type MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';
import appConfig from './config/app.config';

async function bootstrap() {
	const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
		bufferLogs: true,
		transport: Transport.NATS,
		options: {
			servers: appConfig.NATS_SERVER_URL,
			queue: 'match_service'
		}
	});

	app.useLogger(app.get(Logger));
	app.useGlobalInterceptors(new LoggerErrorInterceptor());

	await app.listen();
}

void bootstrap();
