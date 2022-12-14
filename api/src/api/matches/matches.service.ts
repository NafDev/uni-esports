import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import type { GameId } from '@uni-esports/interfaces';
import { isBefore } from 'date-fns';
import { PrismaService } from '../../db/prisma/prisma.service';
import type { CreateNewMatchDto } from './matches.dto';

@Injectable()
export class MatchService {
	private readonly logger = new Logger(MatchService.name);

	constructor(private readonly prisma: PrismaService) {}

	async createNewMatch(matchDto: CreateNewMatchDto) {
		await this.validateMatchDto(matchDto);

		const match = await this.prisma.match.create({
			data: {
				status: 'Scheduled',
				startTime: matchDto.scheduledStart,
				teams: {
					create: matchDto.teams.map((teamId) => ({ teamId }))
				}
			}
		});

		return match;
	}

	async startScheduledMatch(matchId: string, gameId: GameId) {
		switch (gameId) {
			case 'csgo':
				// Call relevant services here
				break;
			default:
				if (!(await this.prisma.game.findUnique({ where: { id: gameId }, select: { id: true } }))) {
					this.logger.error(`Invalid scheduled game ID - ${gameId as string}`);
					return;
				}
		}

		await this.prisma.match.update({
			where: { id: matchId },
			data: { status: 'Ongoing' }
		});
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