import { BadRequestException, Injectable } from '@nestjs/common';
import type { GameId, MatchService as MatchServicePayload } from '@uni-esports/interfaces';
import { add, isBefore } from 'date-fns';
import { firstValueFrom } from 'rxjs';
import type { SessionContainer } from 'supertokens-node/recipe/session';
import { LoggerService } from '../../common/logger-wrapper';
import { PrismaService } from '../../db/prisma/prisma.service';
import { NatsService } from '../../services/clients/nats.service';
import type { CreateNewMatchDto } from './matches.dto';

@Injectable()
export class MatchService {
	private readonly logger = new LoggerService(MatchService.name);

	constructor(private readonly prisma: PrismaService, private readonly natsClient: NatsService) {}

	async startScheduledMatch(matchId: string, gameId: GameId) {
		const resp = await this.prisma.match.updateMany({
			where: { id: matchId, status: 'Scheduled' },
			data: { status: 'Ongoing' }
		});

		if (resp.count === 0) {
			this.logger.log('Scheduled match not found or is already being processed', { matchId });
			return;
		}

		this.logger.log('Scheduled match starting processing', { matchId });

		switch (gameId) {
			case 'csgo':
				// Call relevant services here
				break;
			default:
				this.logger.warn('Unknown game ID found while starting scheduled match - has been marked "Ongoing" anyway', {
					gameId
				});
		}
	}

	async fetchVetoStatus(matchId: string) {
		type MessageReturn = MatchServicePayload['match.veto.status']['res'];
		const source = this.natsClient.send<MessageReturn>('match.veto.status', { matchId });

		return firstValueFrom(source);
	}

	async publishVetoRequest(payload: MatchServicePayload['match.veto._gameId.request'], gameId: GameId) {
		this.natsClient.emit(`match.veto.${gameId}.request`, { ...payload });
	}

	async validateUserVetoRequest(matchId: string, teamId: number, veto: string, session: SessionContainer) {
		const found = await this.prisma.userOnTeam.count({
			where: {
				userId: session.getUserId(),
				teamId,
				captain: true,
				team: {
					matches: { some: { matchId } }
				}
			}
		});

		if (found !== 1) {
			this.logger.warn('Received invalid veto request', { userId: session.getUserId(), matchId, teamId, veto });
			throw new BadRequestException();
		}
	}

	async createNewMatch(matchDto: CreateNewMatchDto) {
		await this.validateMatchDto(matchDto);

		const match = await this.prisma.match.create({
			data: {
				gameId: matchDto.gameId,
				status: 'Scheduled',
				startTime: matchDto.scheduledStart,
				teams: {
					create: matchDto.teams.map((teamId) => ({ teamId }))
				}
			}
		});

		return match;
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
