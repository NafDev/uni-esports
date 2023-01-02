import { Controller } from '@nestjs/common';
import { Ctx, EventPattern, MessagePattern, NatsContext, Payload } from '@nestjs/microservices';
import type { GameId, MatchService } from '@uni-esports/interfaces';
import { LoggerService } from '../../common/logger-wrapper';
import { MatchOrchestrationService } from '../match-orchestration/match-orchestration.service';
import { VetoService } from './veto.service';

@Controller()
export class VetoController {
	private readonly logger = new LoggerService(VetoController.name);

	constructor(
		private readonly vetoService: VetoService,
		private readonly matchOrchestration: MatchOrchestrationService
	) {}

	@MessagePattern('match.veto.status')
	matchVetoStatus(@Payload() data: MatchService['match.veto.status']['req'], @Ctx() ctx: NatsContext) {
		this.logger.log('Received event', { pattern: ctx.getSubject() });

		return this.vetoService.getVetoStatus(data.matchId);
	}

	@EventPattern('match.veto.*.start')
	matchVetoStart(@Payload() data: MatchService['match.veto._gameId.start'], @Ctx() ctx: NatsContext) {
		this.logger.log('Received event', { pattern: ctx.getSubject() });

		const gameId = ctx.getSubject().split('.').at(2)?.toLowerCase() as GameId;

		this.vetoService.startVeto({ ...data, gameId });
	}

	@EventPattern('match.veto.*.request')
	matchVetoRequest(@Payload() data: MatchService['match.veto._gameId.request'], @Ctx() ctx: NatsContext) {
		this.logger.log('Received event', { pattern: ctx.getSubject() });

		const gameId = ctx.getSubject().split('.').at(2)?.toLowerCase() as GameId;

		this.vetoService.processVetoRequest({ ...data, gameId });
	}

	@EventPattern('match.veto.result')
	vetoResult(@Payload() data: MatchService['match.veto.result'], @Ctx() ctx: NatsContext) {
		this.logger.log('Received event', { pattern: ctx.getSubject() });

		void this.matchOrchestration.startMatchWithVetoResult(data);
	}
}
