import { Controller } from '@nestjs/common';
import { Ctx, EventPattern, MessagePattern, NatsContext, Payload } from '@nestjs/microservices';
import { OgmaLogger, OgmaService } from '@ogma/nestjs-module';
import type { GameId, MatchService } from '@uni-esports/interfaces';
import { MatchOrchestrationService } from '../match-orchestration/match-orchestration.service';
import { VetoService } from './veto.service';

@Controller()
export class VetoController {
	constructor(
		@OgmaLogger(VetoController) private readonly logger: OgmaService,
		private readonly vetoService: VetoService,
		private readonly matchOrchestration: MatchOrchestrationService
	) {}

	@MessagePattern('match.veto.status')
	matchVetoStatus(@Payload() data: MatchService['match.veto.status']['req']) {
		return this.vetoService.getVetoStatus(data.matchId);
	}

	@EventPattern('match.veto.*.start')
	matchVetoStart(@Payload() data: MatchService['match.veto._gameId.start'], @Ctx() ctx: NatsContext) {
		const gameId = ctx.getSubject().split('.').at(2)?.toLowerCase() as GameId;

		this.vetoService.startVeto({ ...data, gameId });
	}

	@EventPattern('match.veto.*.request')
	matchVetoRequest(@Payload() data: MatchService['match.veto._gameId.request'], @Ctx() ctx: NatsContext) {
		const gameId = ctx.getSubject().split('.').at(2)?.toLowerCase() as GameId;

		this.vetoService.processVetoRequest({ ...data, gameId });
	}

	@EventPattern('match.veto.result')
	vetoResult(@Payload() data: MatchService['match.veto.result']) {
		void this.matchOrchestration.startMatchWithVetoResult(data);
	}
}
