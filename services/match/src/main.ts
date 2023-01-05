import { NestFactory } from '@nestjs/core';
import { Transport, type MicroserviceOptions } from '@nestjs/microservices';
import { OgmaService } from '@ogma/nestjs-module';
import { AppModule } from './app.module';
import appConfig from './config/app.config';

async function bootstrap() {
	const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
		bufferLogs: true,
		transport: Transport.NATS,
		options: {
			servers: appConfig.NATS_SERVER_URL,
			token: appConfig.NATS_TOKEN,
			queue: 'match_service'
		}
	});

	const logger = app.get<OgmaService>(OgmaService);
	app.useLogger(logger);

	await app.listen();
}

void bootstrap();
