import { Controller, Logger } from '@nestjs/common';
import { Ctx, EventPattern, Payload } from '@nestjs/microservices';
import type { MatchService as MatchServicePayload } from '@uni-esports/interfaces';
import { MatchService } from '../../api/matches/matches.service';

@Controller()
export class MatchSchedulingController {
	private readonly logger = new Logger(MatchSchedulingController.name);

	constructor(private readonly matchService: MatchService) {}

	@EventPattern('match.start')
	startSchedulingMatch(@Payload() data: MatchServicePayload['match.start'], @Ctx() context: any) {
		this.logger.log({ msg: `Received event`, pattern: 'match.start', data, context });
		void this.matchService.startScheduledMatch(data.matchId, data.gameId);
	}
}
