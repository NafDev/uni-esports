import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from './api/auth/auth.guard';

@Controller()
export class AppController {
	@Get('ping')
	ping() {
		return 'OK';
	}

	@Get('session')
	@UseGuards(AuthGuard)
	async validateSession() {
		return 'OK';
	}
}
