import {
	BadRequestException,
	Inject,
	Injectable,
	InternalServerErrorException,
	MessageEvent,
	NotFoundException
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { OgmaLogger, OgmaService } from '@ogma/nestjs-module';
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
import { firstValueFrom, Subject } from 'rxjs';
import type { SessionContainer } from 'supertokens-node/recipe/session';
import { DEFAULT_PAGE_LEN } from '../../config/app.config';
import { PrismaService } from '../../db/prisma/prisma.service';
import { NatsClientInjectionToken } from '../../nats.module';

@Injectable()
export class MatchService {
	private readonly matchEventHandler = new Map<
		string,
		{ public: Subject<MessageEvent>; private: Subject<MessageEvent> }
	>();

	constructor(
		@OgmaLogger(MatchService) private readonly logger: OgmaService,
		@Inject(NatsClientInjectionToken) private readonly natsClient: ClientProxy,
		private readonly prisma: PrismaService
	) {}

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
		const betweenTodayAndNextWeek = {
			gte: new Date(),
			lte: add(Date.now(), { weeks: 1 })
		};

		const data = await this.prisma.match.findMany({
			where: {
				gameId: gameIdFilter,
				status: whereUserIsPlaying ? { in: ['Ongoing', 'Scheduled', 'Setup'] } : undefined,
				startTime: whereUserIsPlaying ? undefined : betweenTodayAndNextWeek,
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

	async getMatchInfo(id: string, session?: SessionContainer) {
		const match = await this.prisma.match.findUnique({
			where: { id },
			include: {
				teams: {
					select: {
						team: { select: { id: true, name: true, users: { select: { userId: true } } } },
						teamNumber: true
					}
				}
			}
		});

		if (!match) {
			throw new NotFoundException();
		}

		let userInMatch = false;

		if (session) {
			const foundUserInMatch = match.teams.find((team) => {
				return team.team.users.find((player) => {
					return player.userId === session.getUserId();
				});
			});

			if (foundUserInMatch) {
				userInMatch = true;
			}
		}

		const matchCleaned = {
			...match,
			teams: match.teams.map((team) => ({ ...team.team, teamNumber: team.teamNumber }))
		};

		switch (match.gameId as GameId) {
			case 'csgo':
				return this.getCsgoMatchDetails(matchCleaned, userInMatch);
			default:
				this.logger.warn('Unknown game ID when fetching match details', { matchId: id });
				break;
		}
	}

	async getCsgoMatchDetails(
		match: Match & { teams: Array<{ id: number; name: string; teamNumber: number }> },
		userInMatch: boolean
	): Promise<IMatchInfo | IMatchDetailsCsgo> {
		const matchDetails = await this.prisma.matchDetailsCsgo.findUnique({
			where: { matchId: match.id },
			select: { map: true, matchId: true, serverConnect: userInMatch, team1score: true, team2score: true }
		});

		if (!matchDetails) {
			return match;
		}

		return {
			...match,
			connectString: matchDetails.serverConnect,
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

	async matchEvents(matchId: string, session: SessionContainer) {
		let isPlayer = false;

		if (session) {
			const findPlayer = await this.prisma.teamOnMatch.count({
				where: {
					matchId,
					team: { users: { some: { userId: session.getUserId() } } }
				}
			});
			if (findPlayer === 1) {
				isPlayer = true;
			}
		}

		let stream = this.matchEventHandler.get(matchId);

		if (!stream) {
			this.matchEventHandler.set(matchId, { private: new Subject(), public: new Subject() });
			stream = this.matchEventHandler.get(matchId);
		}

		if (!stream) {
			this.logger.warn('Error while retrieving match event stream - value is undefined for match ID', { matchId });
			throw new InternalServerErrorException();
		}

		if (isPlayer) {
			return stream.private.asObservable();
		}

		return stream.public.asObservable();
	}

	broadcastMatchEvent(matchId: string, data: MessageEvent, privilegedEvent = false) {
		const stream = this.matchEventHandler.get(matchId);

		if (!stream) {
			this.logger.info('Received match event but no stream present to broadcast to', { matchId, eventData: data });
			return;
		}

		data = { ...data, id: nanoid() };

		this.logger.debug('Broadcasting match event', { matchId, data });

		if (privilegedEvent) {
			stream.private.next(data);
			return;
		}

		stream.private.next(data);
		stream.public.next(data);
	}

	private async publishVetoRequest(payload: MatchServicePayload['match.veto._gameId.request'], gameId: GameId) {
		this.natsClient.emit(`match.veto.${gameId.toLowerCase()}.request`, { ...payload });
	}
}
