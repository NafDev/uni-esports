import { Module } from '@nestjs/common';
import { GameService } from './games.service';

@Module({
	controllers: [],
	providers: [GameService]
})
export class GameModule {}
