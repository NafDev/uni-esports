import { Controller, Logger } from '@nestjs/common';
import { Ctx, EventPattern, Payload } from '@nestjs/microservices';
import type { MatchService } from '@uni-esports/interfaces/services';

@Controller()
export class MatchSchedulingController {
	private readonly logger = new Logger(MatchSchedulingController.name);

	@EventPattern('match.start')
	startSchedulingMatch(@Payload() data: MatchService['match.start'], @Ctx() context: any) {
		this.logger.log({ msg: `Received event`, pattern: 'match.start', data, context });
		// Business logic
	}
}
