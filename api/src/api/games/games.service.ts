import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../db/prisma/prisma.service';
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
}
