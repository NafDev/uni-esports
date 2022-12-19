import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import type { MatchService as MatchServicePayload } from '@uni-esports/interfaces';
import { MatchService } from '../../api/matches/matches.service';
import { LoggerService } from '../../common/logger-wrapper';

@Controller()
export class MatchSchedulingController {
	private readonly logger = new LoggerService(MatchSchedulingController.name);

	constructor(private readonly matchService: MatchService) {}

	@EventPattern('match.start')
	startSchedulingMatch(@Payload() data: MatchServicePayload['match.start']) {
		this.logger.log('Received event', { pattern: 'match.start', data });
		void this.matchService.startScheduledMatch(data.matchId, data.gameId);
	}
}
