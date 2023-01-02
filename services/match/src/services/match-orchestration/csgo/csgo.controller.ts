import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { CsgoService } from './csgo.service';
import type { MatchRoundInfo, MatchEndInfo } from './dathost-api'; // eslint-disable-line @typescript-eslint/consistent-type-imports

@Controller()
export class CsgoController {
	constructor(private readonly csgoService: CsgoService) {}

	@EventPattern('match.event.csgo.round')
	processRoundEndWebhook(@Payload() data: MatchRoundInfo) {
		void this.csgoService.updateScores(
			data.matchId,
			data.roundData.team1_stats.score,
			data.roundData.team2_stats.score
		);
	}

	@EventPattern('match.event.csgo.match')
	processMatchEndWebhook(@Payload() data: MatchEndInfo) {
		void this.csgoService.endMatch(data.matchId, data.matchData);
	}
}
