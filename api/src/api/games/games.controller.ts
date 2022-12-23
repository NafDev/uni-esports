import { Controller, Get } from '@nestjs/common';
import type { GameListItem } from '@uni-esports/interfaces';
import { GameService } from './games.service';

@Controller('games')
export class GamesController {
	constructor(private readonly gameService: GameService) {}

	@Get('list')
	async getGamesList(): Promise<GameListItem[]> {
		return this.gameService.getGameList();
	}
}
