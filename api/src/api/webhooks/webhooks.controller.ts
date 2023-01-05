import { Body, Controller, Inject, Param, ParseUUIDPipe, Post, UseGuards, ValidationPipe } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import type { MatchService as MatchServiceInterface } from '@uni-esports/interfaces';
import { NatsClientInjectionToken } from '../../nats.module';
import { JwtGuard } from '../auth/jwt.guard';
import { MatchService } from '../matches/matches.service';

@Controller('webhooks')
export class WebhooksController {
	constructor(
		@Inject(NatsClientInjectionToken) private readonly natsClient: ClientProxy,
		private readonly matchService: MatchService
	) {}

	@UseGuards(new JwtGuard('dathost'))
	@Post('csgo/:matchId/round-end')
	async roundEnd(
		@Param('matchId', ParseUUIDPipe) matchId: string,
		@Body(new ValidationPipe({ disableErrorMessages: true })) body: Record<string, any>
	) {
		const data: MatchServiceInterface['match.event.csgo.round'] = {
			matchId,
			roundData: body
		};

		this.natsClient.emit(`match.event.${matchId}.csgo.round`, data);

		const sseData: MatchServiceInterface['match_round'] = {
			team1Score: body.team1_stats.score,
			team2Score: body.team2_stats.score
		};

		this.matchService.broadcastMatchEvent(matchId, { data: sseData, type: 'match_round' });
	}

	@UseGuards(new JwtGuard('dathost'))
	@Post('csgo/:matchId/match-end')
	async matchEnd(
		@Param('matchId', ParseUUIDPipe) matchId: string,
		@Body(new ValidationPipe({ disableErrorMessages: true })) body: Record<string, any>
	) {
		const data: MatchServiceInterface['match.event.csgo.match'] = {
			matchId,
			matchData: body
		};

		this.natsClient.emit(`match.event.${matchId}.csgo.match`, data);

		const sseData: MatchServiceInterface['match_end'] = {
			team1Score: body.team1_stats.score,
			team2Score: body.team2_stats.score
		};

		this.matchService.broadcastMatchEvent(matchId, { data: sseData, type: 'match_end' });
	}
}
