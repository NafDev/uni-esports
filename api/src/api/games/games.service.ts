import { Injectable, OnModuleInit } from '@nestjs/common';
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
}
