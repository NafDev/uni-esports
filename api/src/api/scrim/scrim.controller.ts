import { Body, Controller, Get, Patch, Post, Session, UseGuards } from '@nestjs/common';
import type { SessionContainer } from 'supertokens-node/recipe/session';
import { AuthGuard } from '../auth/auth.guard';
import { AcceptScrimDto, CreateScrimDto } from './scrim.dto';
import { ScrimService } from './scrim.service';

@Controller('scrims')
export class ScrimController {
	constructor(private readonly scrimService: ScrimService) {}

	@Get()
	async getOpenScrims() {
		return this.scrimService.getOpenScrims();
	}

	@UseGuards(AuthGuard)
	@Post('new')
	async createNewScrimRequest(@Body() body: CreateScrimDto, @Session() session: SessionContainer) {
		return this.scrimService.createNewScrim(body, session);
	}

	@UseGuards(AuthGuard)
	@Patch('accept')
	async acceptScrimRequest(@Body() body: AcceptScrimDto, @Session() session: SessionContainer) {
		return this.scrimService.acceptScrim(body.scrimId, body.teamId, session);
	}
}
