import {
	BadRequestException,
	Injectable,
	InternalServerErrorException,
	MessageEvent,
	NotFoundException
} from '@nestjs/common';
import type { Match } from '@prisma/client';
import type {
	GameId,
	IMatchDetailsCsgo,
	IMatchInfo,
	MatchService as MatchServicePayload
} from '@uni-esports/interfaces';
import { add, isBefore } from 'date-fns';
import { nanoid } from 'nanoid';
import { firstValueFrom, Observable, Subject } from 'rxjs';
import type { SessionContainer } from 'supertokens-node/recipe/session';
import { LoggerService } from '../../common/logger-wrapper';
import { PrismaService } from '../../db/prisma/prisma.service';
import { NatsService } from '../../services/clients/nats.service';
import type { CreateNewMatchDto } from './matches.dto';

@Injectable()
export class MatchService {
	private readonly logger = new LoggerService(MatchService.name);

	private readonly matchEventHandler = new Map<string, Subject<MessageEvent>>();

	constructor(private readonly prisma: PrismaService, private readonly natsClient: NatsService) {}

	async getMatchInfo(id: string) {
		const match = await this.prisma.match.findUnique({
			where: { id },
			include: {
				teams: {
					select: {
						team: { select: { id: true, name: true } },
						teamNumber: true
					}
				}
			}
		});

		if (!match) {
			throw new NotFoundException();
		}

		const matchCleaned = {
			...match,
			teams: match.teams.map((team) => ({ ...team.team, teamNumber: team.teamNumber }))
		};

		switch (match.gameId as GameId) {
			case 'csgo':
				return this.getCsgoMatchDetails(matchCleaned);
			default:
				this.logger.warn('Unknown game ID when fetching match details', { matchId: id });
				break;
		}
	}

	async getCsgoMatchDetails(
		match: Match & { teams: Array<{ id: number; name: string; teamNumber: number }> }
	): Promise<IMatchInfo | IMatchDetailsCsgo> {
		const matchDetails = await this.prisma.matchDetailsCsgo.findUnique({ where: { matchId: match.id } });

		if (!matchDetails) {
			return match;
		}

		return {
			...match,
			map: matchDetails.map,
			team1Score: matchDetails.team1score,
			team2Score: matchDetails.team2score
		};
	}

	async fetchVetoStatus(matchId: string) {
		type MessageReturn = MatchServicePayload['match.veto.status']['res'];
		const source = this.natsClient.send<MessageReturn>('match.veto.status', { matchId });

		return firstValueFrom(source);
	}

	async validateAndSendUserVetoRequest(
		props: { matchId: string; teamId: number; veto: string; gameId: GameId },
		session: SessionContainer
	) {
		const { matchId, teamId, veto, gameId } = props;

		const found = await this.prisma.teamOnMatch.count({
			where: {
				matchId,
				teamId,
				team: {
					users: {
						some: { userId: session.getUserId(), captain: true }
					}
				}
			}
		});

		if (found !== 1) {
			this.logger.warn('Received invalid veto request', { userId: session.getUserId(), matchId, teamId, veto });
			throw new BadRequestException();
		}

		void this.publishVetoRequest({ matchId, teamId, veto }, gameId);
	}

	matchEvents(matchId: string): Observable<MessageEvent> {
		let stream = this.matchEventHandler.get(matchId);

		if (!stream) {
			this.matchEventHandler.set(matchId, new Subject());
			stream = this.matchEventHandler.get(matchId);
		}

		if (!stream) {
			this.logger.error('Error while retrieving match event stream - value is undefined for match ID', { matchId });
			throw new InternalServerErrorException();
		}

		return stream.asObservable();
	}

	broadcastMatchEvent(matchId: string, data: MessageEvent) {
		const stream = this.matchEventHandler.get(matchId);

		if (!stream) {
			this.logger.log('Received match event but no stream present to broadcast to', { matchId, eventData: data });
			return;
		}

		data = { ...data, id: nanoid() };

		stream.next(data);
	}

	private async publishVetoRequest(payload: MatchServicePayload['match.veto._gameId.request'], gameId: GameId) {
		this.natsClient.emit(`match.veto.${gameId.toLowerCase()}.request`, { ...payload });
	}
}
