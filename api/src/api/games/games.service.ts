import { Injectable } from '@nestjs/common';
import type { IGameMatchResult, Pagination } from '@uni-esports/interfaces';
import { PrismaService } from '../../db/prisma/prisma.service';
import { prismaPaginationSkipTake } from '../../util/utility';
import type { CreateNewGameDto } from './games.dto';

@Injectable()
export class GameService {
	constructor(private readonly prisma: PrismaService) {}

	async createNewGame(newGameDto: CreateNewGameDto) {
		await this.prisma.game.create({
			data: { ...newGameDto }
		});
	}

	async getGameList() {
		return this.prisma.game.findMany({
			select: { id: true, displayName: true }
		});
	}

	async checkCsgoTeamValidity(teamId: number) {
		const checkValidatedSteamLinkedUsers = await this.prisma.user.count({
			where: {
				verified: true,
				steam64Id: { not: null },
				teams: { some: { teamId } }
			}
		});

		return checkValidatedSteamLinkedUsers >= 5;
	}

	async getRecentMatches(gameId: string, page: number, limit: number): Promise<Pagination<IGameMatchResult>> {
		const [count, data] = await this.prisma.$transaction([
			this.prisma.match.count({
				where: {
					gameId,
					status: { in: ['Ongoing', 'Completed'] }
				}
			}),
			this.prisma.match.findMany({
				where: {
					gameId,
					status: { in: ['Ongoing', 'Completed'] }
				},
				select: {
					id: true,
					startTime: true,
					status: true,
					teams: {
						select: { team: { select: { name: true } }, score: true }
					}
				},
				orderBy: { startTime: 'desc' },
				...prismaPaginationSkipTake(page, limit)
			})
		]);

		const results: IGameMatchResult[] = data.map((entry) => ({
			id: entry.id,
			startTime: entry.startTime,
			status: entry.status as IGameMatchResult['status'],
			teams: entry.teams.map((team) => ({ score: team.score, name: team.team.name }))
		}));

		return [count, results];
	}
}
