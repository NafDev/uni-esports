import {
	BadRequestException,
	Injectable,
	InternalServerErrorException,
	MessageEvent,
	NotFoundException
} from '@nestjs/common';
import type { Match, Prisma } from '@prisma/client';
import type {
	GameId,
	IMatchDetailsCsgo,
	IMatchInfo,
	IUpcomingMatch,
	MatchService as MatchServicePayload
} from '@uni-esports/interfaces';
import { add } from 'date-fns';
import { nanoid } from 'nanoid';
import { firstValueFrom, Observable, Subject } from 'rxjs';
import type { SessionContainer } from 'supertokens-node/recipe/session';
import { LoggerService } from '../../common/logger-wrapper';
import { DEFAULT_PAGE_LEN } from '../../config/app.config';
import { PrismaService } from '../../db/prisma/prisma.service';
import { NatsService } from '../../services/clients/nats.service';

@Injectable()
export class MatchService {
	private readonly logger = new LoggerService(MatchService.name);

	private readonly matchEventHandler = new Map<string, Subject<MessageEvent>>();

	constructor(private readonly prisma: PrismaService, private readonly natsClient: NatsService) {}

	async getUpcomingMatches(
		session: SessionContainer,
		gameIdFilter: string,
		forSessionUserFilter: boolean
	): Promise<IUpcomingMatch[]> {
		const whereUserIsPlaying = session && forSessionUserFilter;
		const filterByUserPlaying: Prisma.TeamOnMatchListRelationFilter | false = whereUserIsPlaying && {
			some: {
				team: { users: { some: { userId: session.getUserId() } } }
			}
		};

		const data = await this.prisma.match.findMany({
			where: {
				gameId: gameIdFilter,
				status: whereUserIsPlaying ? { in: ['Ongoing', 'Scheduled', 'Setup'] } : undefined,
				startTime: whereUserIsPlaying
					? undefined
					: {
							gte: new Date(),
							lte: add(Date.now(), { weeks: 1 })
					  },
				teams: filterByUserPlaying || undefined
			},
			select: {
				gameId: true,
				startTime: true,
				id: true,
				teams: {
					select: {
						team: {
							select: {
								universityId: true
							}
						}
					}
				}
			},
			orderBy: { startTime: 'asc' },
			take: DEFAULT_PAGE_LEN
		});

		return data.map((entry) => ({
			matchId: entry.id,
			gameId: entry.gameId as GameId,
			tournamentId: null, // Assign later when tournaments are implemented
			time: entry.startTime,
			universityIds: entry.teams.map((team) => team.team.universityId)
		}));
	}

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

		this.logger.log('Broadcasting match event', { matchId, data });

		stream.next(data);
	}

	private async publishVetoRequest(payload: MatchServicePayload['match.veto._gameId.request'], gameId: GameId) {
		this.natsClient.emit(`match.veto.${gameId.toLowerCase()}.request`, { ...payload });
	}
}
