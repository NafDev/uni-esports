import { Controller } from '@nestjs/common';
import { Ctx, EventPattern, NatsContext, Payload } from '@nestjs/microservices';
import type { MatchService } from '@uni-esports/interfaces';
import { LoggerService } from '../../common/logger-wrapper';
import { MatchSchedulingService } from './match-scheduling.service';

@Controller('match-scheduling')
export class MatchSchedulingController {
	private readonly logger = new LoggerService(MatchSchedulingController.name);
	constructor(private readonly matchScheduling: MatchSchedulingService) {}

	@EventPattern('match.start')
	startMatch(@Payload() data: MatchService['match.start'], @Ctx() ctx: NatsContext) {
		this.logger.log('Received event', { pattern: ctx.getSubject() });

		this.matchScheduling.processMatchStartEvent(data);
	}
}
