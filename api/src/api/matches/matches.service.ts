import { BadRequestException, Injectable, InternalServerErrorException, MessageEvent } from '@nestjs/common';
import type { GameId, MatchService as MatchServicePayload } from '@uni-esports/interfaces';
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

	async scheduledNewMatch(matchDto: CreateNewMatchDto) {
		await this.validateMatchDto(matchDto);

		const match = await this.prisma.match.create({
			data: {
				gameId: matchDto.gameId,
				status: 'Scheduled',
				startTime: matchDto.scheduledStart,
				teams: {
					create: matchDto.teams.map((teamId, index) => ({ teamId, teamNumber: index + 1 }))
				}
			}
		});

		return match;
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

	private async validateMatchDto(matchDto: CreateNewMatchDto) {
		if (isBefore(matchDto.scheduledStart, add(Date.now(), { days: 1 }))) {
			throw new BadRequestException('Match must be scheduled at least 24 hours from now');
		}

		const game = await this.prisma.game.findUnique({
			where: { id: matchDto.gameId },
			select: { teamsPerMatch: true }
		});

		if (!game) {
			throw new BadRequestException('Invalid game ID');
		}

		if (game.teamsPerMatch === matchDto.teams.length) {
			throw new BadRequestException('Invalid number of teams for this match');
		}
	}
}
