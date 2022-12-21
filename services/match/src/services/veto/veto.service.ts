import { Injectable } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import type { GameId, MatchService } from '@uni-esports/interfaces';
import { add, isAfter } from 'date-fns';
import ms from 'ms';
import { LoggerService } from '../../common/logger-wrapper';
import appConfig from '../../config/app.config';
import { NatsService } from '../clients/nats.service';

type VetoRequestPayload = MatchService['match.veto._gameId.request'] & { gameId: GameId };
type VetoStartPayload = MatchService['match.veto._gameId.start'] & { gameId: GameId };

type VetoHistoryValue = {
	vetoed: string[];
	remaining: string[];
	teamAid: string;
	teamBid: string;
	lastVetoTeamId: string;
	lastVetoTime: Date;
};

@Injectable()
export class VetoService {
	private readonly logger = new LoggerService(VetoService.name);

	private readonly vetoHistory = new Map<string, VetoHistoryValue>();

	constructor(private readonly natsClient: NatsService, private readonly schedulerRegistry: SchedulerRegistry) {}

	startVeto(data: VetoStartPayload) {
		const { matchId, gameId } = data;

		if (!matchId || !gameId) {
			this.logger.error('Error when starting veto: one or more required parameters are empty', { ...data });
			return;
		}

		if (this.vetoHistory.get(matchId)) {
			this.logger.warn('Error when starting veto: match ID has existing veto history', { matchId });
			return;
		}

		this.vetoHistory.set(matchId, {
			vetoed: [],
			remaining: [],
			lastVetoTime: new Date(),
			lastVetoTeamId: data.teamBid,
			teamAid: data.teamAid,
			teamBid: data.teamBid
		});
	}

	processVetoRequest(data: VetoRequestPayload) {
		const { matchId, teamId, veto, gameId } = data;

		if (!matchId || !teamId || !veto || !gameId) {
			this.logger.error('Error when processing veto: one or more required parameters are empty', { ...data });
			return;
		}

		const currentVetoHistory = this.vetoHistory.get(matchId);

		if (!currentVetoHistory) {
			this.logger.warn('Error when processing veto: current veto history does not exist', { matchId });
			return;
		}

		if (teamId === currentVetoHistory.lastVetoTeamId) {
			this.logger.warn('Error when processing veto: requesting team ID had last veto', { matchId, teamId, veto });
			return;
		}

		if (currentVetoHistory.vetoed.includes(veto)) {
			this.logger.warn('Error when processing veto: choice is already vetoed', { matchId, teamId, veto });
			return;
		}

		// This check isn't logically needed, but added to prevent a conflict with randomised votes
		const vetoDeadline = add(currentVetoHistory.lastVetoTime, { seconds: 1 + appConfig.VETO_HAND_TIMEOUT / 1000 });
		if (isAfter(Date.now(), vetoDeadline)) {
			this.logger.warn('Received veto request after deadline', { matchId, teamId, veto });
		}

		let updatedVetoHistory: VetoHistoryValue | undefined;

		switch (gameId) {
			case 'csgo': {
				updatedVetoHistory = this.processVetoOptions(data, currentVetoHistory, appConfig.VETO_CSGO_POOL);
				break;
			}

			default: {
				this.logger.warn('Processing veto for unknown game ID', { gameId });
				break;
			}
		}

		if (updatedVetoHistory) {
			this.vetoHistory.set(matchId, updatedVetoHistory);

			const timeoutId = `random-vote-${matchId}`;
			this.schedulerRegistry.deleteTimeout(timeoutId);

			if (updatedVetoHistory.vetoed.length === 1) {
				this.endVeto(matchId, updatedVetoHistory.vetoed[0]);
				return;
			}

			this.scheduleRandomVote(matchId, gameId, timeoutId, updatedVetoHistory);

			const emitVetoUpdate: MatchService['match.veto._gameId.update'] = {
				matchId,
				time: updatedVetoHistory.lastVetoTime.toISOString(),
				vetoed: veto
			};
			this.natsClient.emit(`match.veto.${gameId}.update`, emitVetoUpdate);
		}
	}

	endVeto(matchId: string, result: string) {
		this.natsClient.emit('match.veto.result', { matchId, result });

		// Probably add result to some DB row here

		setTimeout(() => this.vetoHistory.delete(matchId), appConfig.VETO_RESULT_TTL);
	}

	scheduleRandomVote(matchId: string, gameId: string, timeoutId: string, vetoHistory: VetoHistoryValue) {
		const remainingChoices = [...vetoHistory.remaining];

		const previousVetoWasTeamA = vetoHistory.lastVetoTeamId === vetoHistory.teamAid;
		const voteOnBehalfOf = previousVetoWasTeamA ? vetoHistory.teamBid : vetoHistory.teamAid;

		const randomisedVeto = () => {
			const randomVetoIndex = Math.floor(Math.random() * remainingChoices.length);
			const vetoRequest: MatchService['match.veto._gameId.request'] = {
				matchId,
				teamId: voteOnBehalfOf,
				veto: remainingChoices[randomVetoIndex]
			};

			this.natsClient.emit(`match.veto.${gameId}.request`, vetoRequest);
			this.schedulerRegistry.deleteTimeout(timeoutId);
		};

		this.schedulerRegistry.addTimeout(timeoutId, setTimeout(randomisedVeto, appConfig.VETO_HAND_TIMEOUT + ms('3s')));
	}

	processVetoOptions(
		vetoRequestPayload: VetoRequestPayload,
		vetoHistory: VetoHistoryValue,
		optionPool: string[]
	): VetoHistoryValue | undefined {
		const { veto, matchId, teamId } = vetoRequestPayload;
		const { vetoed } = vetoHistory;

		const remainingMaps = optionPool.filter((map) => !vetoed.includes(map));

		if (remainingMaps.length <= 1) {
			this.logger.error('Error while processing veto: received request for a completed veto', { matchId, teamId });
			return;
		}

		vetoed.push(veto);

		return {
			...vetoHistory,
			vetoed,
			remaining: remainingMaps,
			lastVetoTime: new Date(),
			lastVetoTeamId: teamId
		};
	}

	getVetoStatus(matchId: string) {
		const data = this.vetoHistory.get(matchId);
		if (!data) {
			return { vetoed: [], pool: [] };
		}

		return { vetoed: data.vetoed, pool: [...data.vetoed, ...data.remaining] };
	}
}
