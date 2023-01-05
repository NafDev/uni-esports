import { Module } from '@nestjs/common';
import { OgmaModule } from '@ogma/nestjs-module';
import { GamesController } from './games.controller';
import { GameService } from './games.service';

@Module({
	providers: [GameService],
	controllers: [GamesController],
	exports: [GameService],
	imports: [OgmaModule.forFeatures([GamesController, GameService])]
})
export class GameModule {}
