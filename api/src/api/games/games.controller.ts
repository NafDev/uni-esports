import { Controller, Get, Param, Query } from '@nestjs/common';
import type { GameListItem } from '@uni-esports/interfaces';
import { ParsePositiveIntPipe } from '../../common/pipes/positive-int.pipe';
import { GameService } from './games.service';

@Controller('games')
export class GamesController {
	constructor(private readonly gameService: GameService) {}

	@Get('list')
	async getGamesList(): Promise<GameListItem[]> {
		return this.gameService.getGameList();
	}

	@Get(':gameId/recent-matches')
	async getRecentGameResults(
		@Param('gameId') gameId: string,
		@Query('page', ParsePositiveIntPipe) page: number,
		@Query('limit', ParsePositiveIntPipe) limit: number
	) {
		return this.gameService.getRecentMatches(gameId, page, limit);
	}
}
