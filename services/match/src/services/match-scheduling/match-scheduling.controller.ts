import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import type { MatchService } from '@uni-esports/interfaces';
import { MatchSchedulingService } from './match-scheduling.service';

@Controller('match-scheduling')
export class MatchSchedulingController {
	constructor(private readonly matchScheduling: MatchSchedulingService) {}

	@EventPattern('match.start')
	startMatch(@Payload() data: MatchService['match.start']) {
		this.matchScheduling.processMatchStartEvent(data);
	}
}
