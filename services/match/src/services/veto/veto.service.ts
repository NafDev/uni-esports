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
	teamAid: number;
	teamBid: number;
	lastVetoTeamId: number;
	lastVetoTime: Date;
	gameId: GameId;
};

const vetoTimeoutId = (matchId: string) => `random-vote-${matchId.toLowerCase()}`;

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

		let mapPool: string[];

		switch (gameId) {
			case 'csgo': {
				mapPool = appConfig.VETO_CSGO_POOL;
				break;
			}

			default: {
				this.logger.warn('Unknown game ID when starting map veto', { gameId });
				return;
			}
		}

		const initialMatchVetoHistory = {
			vetoed: [],
			remaining: mapPool,
			lastVetoTime: new Date(),
			lastVetoTeamId: data.teamBid,
			teamAid: data.teamAid,
			teamBid: data.teamBid,
			gameId: data.gameId
		};

		this.vetoHistory.set(matchId, initialMatchVetoHistory);

		this.scheduleRandomVote(matchId, gameId, initialMatchVetoHistory);

		this.logger.log('Starting match veto', { matchId, gameId });

		const vetoStartData: MatchService['match.start'] = { matchId, gameId };
		this.natsClient.emit('match.veto.start', vetoStartData);
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

		if (!currentVetoHistory.remaining.includes(veto)) {
			this.logger.warn('Error when processing veto: invalid choice', { matchId, teamId, veto });
			return;
		}

		if (currentVetoHistory.gameId !== gameId) {
			this.logger.warn('Error when processing veto: game ID mismatch', {
				matchId,
				teamId,
				gameId,
				expectedGameId: currentVetoHistory.gameId
			});
			return;
		}

		// This check isn't logically needed, but added to prevent a conflict with randomised votes
		const vetoDeadline = add(currentVetoHistory.lastVetoTime, { seconds: 3 + appConfig.VETO_HAND_TIMEOUT / 1000 });
		if (isAfter(Date.now(), vetoDeadline)) {
			this.logger.warn('Received veto request after deadline', { matchId, teamId, veto });
			return;
		}

		const updatedVetoHistory: VetoHistoryValue = {
			...currentVetoHistory,
			vetoed: [...currentVetoHistory.vetoed, veto],
			remaining: currentVetoHistory.remaining.filter((map) => map !== veto),
			lastVetoTime: new Date(),
			lastVetoTeamId: teamId
		};

		this.vetoHistory.set(matchId, updatedVetoHistory);

		try {
			this.schedulerRegistry.deleteTimeout(vetoTimeoutId(matchId));
		} catch (error: unknown) {
			if (!(error instanceof Error && error.message.startsWith('No Timeout'))) {
				throw error;
			}
		}

		if (updatedVetoHistory.remaining.length === 1) {
			this.endVeto({ matchId, result: updatedVetoHistory.remaining[0], gameId });
			return;
		}

		this.scheduleRandomVote(matchId, gameId, updatedVetoHistory);

		const emitVetoUpdate: MatchService['match.veto.update'] = {
			matchId,
			teamId: updatedVetoHistory.lastVetoTeamId,
			time: updatedVetoHistory.lastVetoTime.toISOString(),
			vetoed: veto
		};
		this.natsClient.emit(`match.veto.update`, emitVetoUpdate);
	}

	endVeto(data: MatchService['match.veto.result']) {
		this.natsClient.emit('match.veto.result', data);

		setTimeout(() => this.vetoHistory.delete(data.matchId), appConfig.VETO_RESULT_TTL);
	}

	scheduleRandomVote(matchId: string, gameId: string, vetoHistory: VetoHistoryValue) {
		const timeoutId = vetoTimeoutId(matchId);

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

			this.logger.log('Setting randomised vote due to veto hand timeout', { matchId });

			this.natsClient.emit(`match.veto.${gameId}.request`, vetoRequest);
			this.schedulerRegistry.deleteTimeout(timeoutId);
		};

		this.schedulerRegistry.addTimeout(timeoutId, setTimeout(randomisedVeto, appConfig.VETO_HAND_TIMEOUT + ms('1.5s')));
	}

	getVetoStatus(matchId: string): MatchService['match.veto.status']['res'] {
		const data = this.vetoHistory.get(matchId);
		if (!data) {
			return { status: 0 };
		}

		return {
			vetoed: data.vetoed,
			teamId: data.lastVetoTeamId,
			time: data.lastVetoTime as unknown as string,
			status: 'Ongoing'
		};
	}
}
