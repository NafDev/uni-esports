import { INestApplication, Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

import appConfig from '../../config/app.config';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
	constructor() {
		super({
			log: appConfig.isProd ? undefined : ['query', 'info', 'warn', 'error']
		});
	}

	async onModuleInit() {
		await this.$connect();
	}

	async enableShutdownHooks(app: INestApplication) {
		this.$on('beforeExit', async () => {
			await app.close();
		});
	}
}
