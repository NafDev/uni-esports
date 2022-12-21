import { Module } from '@nestjs/common';
import { GameService } from './games.service';

@Module({
	providers: [GameService]
})
export class GameModule {}
