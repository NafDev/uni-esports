import { Controller } from '@nestjs/common';
import { Ctx, EventPattern, NatsContext, Payload } from '@nestjs/microservices';
import { OgmaLogger, OgmaService } from '@ogma/nestjs-module';
import type { MatchService } from '@uni-esports/interfaces';
import { MatchSchedulingService } from './match-scheduling.service';

@Controller('match-scheduling')
export class MatchSchedulingController {
	constructor(
		@OgmaLogger(MatchSchedulingController) private readonly logger: OgmaService,
		private readonly matchScheduling: MatchSchedulingService
	) {}

	@EventPattern('match.start')
	startMatch(@Payload() data: MatchService['match.start'], @Ctx() ctx: NatsContext) {
		this.matchScheduling.processMatchStartEvent(data);
	}
}
