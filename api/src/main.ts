import { INestApplication, ValidationPipe } from '@nestjs/common';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { OgmaService } from '@ogma/nestjs-module';
import helmet from 'helmet';
import SuperTokens from 'supertokens-node';
import { SupertokensExceptionFilter } from './api/auth/auth.filter';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/exception.filter';
import appConfig from './config/app.config';
import { PrismaExceptionFilter } from './db/prisma/prisma.filter';

async function bootstrap() {
	const app = await NestFactory.create(AppModule, { bufferLogs: true });

	const logger = app.get<OgmaService>(OgmaService);
	app.useLogger(logger);

	app.getHttpAdapter().getInstance().set('etag', false);
	app.use(helmet());
	app.enableCors({
		origin: [appConfig.WEB_DOMAIN],
		allowedHeaders: ['content-type', ...SuperTokens.getAllCORSHeaders()],
		credentials: true
	});

	app.useGlobalFilters(new AllExceptionsFilter(logger, app.get(HttpAdapterHost)));
	app.useGlobalFilters(new SupertokensExceptionFilter());
	app.useGlobalFilters(new PrismaExceptionFilter(logger));

	app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));

	await startMicroservices(app);

	await app.listen(appConfig.PORT);
}

async function startMicroservices(app: INestApplication) {
	app.connectMicroservice<MicroserviceOptions>({
		transport: Transport.NATS,
		options: {
			servers: appConfig.NATS_SERVER_URL,
			token: appConfig.NATS_TOKEN
		}
	});

	await app.startAllMicroservices();
}

void bootstrap();
