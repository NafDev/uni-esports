import { BadRequestException, Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import type { IMatchListItem, Pagination } from '@uni-esports/interfaces';
import { isBefore, add } from 'date-fns';
import { LoggerService } from '../../../common/logger-wrapper';
import { PrismaService } from '../../../db/prisma/prisma.service';
import { prismaPaginationSkipTake } from '../../../util/utility';
import { GameService } from '../../games/games.service';
import type { CreateNewMatchDto, MatchSearchFilters } from '../../matches/matches.dto';

@Injectable()
export class AdminMatchService {
	private readonly logger = new LoggerService(AdminMatchService.name);

	constructor(private readonly prisma: PrismaService, private readonly gameService: GameService) {}

	async getMatches(filters: MatchSearchFilters, page: number): Promise<Pagination<IMatchListItem>> {
		const { id, gameId, startTimeLowerLimit, startTimeUpperLimit } = filters;

		const where: Prisma.Enumerable<Prisma.MatchWhereInput> = {
			id,
			gameId,
			status: filters.status,
			startTime: {
				lte: startTimeUpperLimit,
				gte: startTimeLowerLimit
			}
		};

		const [count, data] = await this.prisma.$transaction([
			this.prisma.match.count({ where }),
			this.prisma.match.findMany({
				where,
				...prismaPaginationSkipTake(page),
				select: { id: true, gameId: true, startTime: true, status: true },
				orderBy: { startTime: 'desc' }
			})
		]);

		return [count, data];
	}

	async scheduleNewMatch(matchDto: CreateNewMatchDto) {
		await this.validateMatchDto(matchDto);

		const match = await this.prisma.match.create({
			data: {
				gameId: matchDto.gameId,
				status: 'Scheduled',
				startTime: matchDto.scheduledStart,
				teams: {
					create: matchDto.teamIds.map((teamId, index) => ({ teamId, teamNumber: index + 1 }))
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

		if (game.teamsPerMatch !== matchDto.teamIds.length) {
			throw new BadRequestException('Invalid number of teams for this match');
		}

		if (matchDto.gameId === 'csgo') {
			const [a, b] = await Promise.all([
				this.gameService.checkCsgoTeamValidity(matchDto.teamIds[0]),
				this.gameService.checkCsgoTeamValidity(matchDto.teamIds[1])
			]);

			if (!a || !b) {
				throw new BadRequestException('Both teams should have at least 5 verified players with a linked Steam 64 ID');
			}
		}
	}
}
