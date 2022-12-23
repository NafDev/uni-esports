import { Controller } from '@nestjs/common';
import { MatchService } from '../../api/matches/matches.service';
import { LoggerService } from '../../common/logger-wrapper';

@Controller()
export class MatchSchedulingController {
	private readonly logger = new LoggerService(MatchSchedulingController.name);

	constructor(private readonly matchService: MatchService) {}
}
