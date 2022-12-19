import { BadRequestException, Injectable } from '@nestjs/common';
import type { GameId } from '@uni-esports/interfaces';
import { isBefore } from 'date-fns';
import { LoggerService } from '../../common/logger-wrapper';
import { PrismaService } from '../../db/prisma/prisma.service';
import type { CreateNewMatchDto } from './matches.dto';

@Injectable()
export class MatchService {
	private readonly logger = new LoggerService(MatchService.name);

	constructor(private readonly prisma: PrismaService) {}

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
		if (isBefore(matchDto.scheduledStart, Date.now())) {
			throw new BadRequestException('Match must be scheduled in the future');
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
