import { Module } from '@nestjs/common';
import { GameService } from './games.service';
import { GamesController } from './games.controller';

@Module({
	providers: [GameService],
	controllers: [GamesController],
	exports: [GameService]
})
export class GameModule {}
