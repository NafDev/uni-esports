import { Module } from '@nestjs/common';
import { OgmaModule } from '@ogma/nestjs-module';
import { GameModule } from '../games/games.module';
import { ScrimController } from './scrim.controller';
import { ScrimService } from './scrim.service';

@Module({
	controllers: [ScrimController],
	providers: [ScrimService],
	imports: [OgmaModule.forFeatures([ScrimController, ScrimService]), GameModule]
})
export class ScrimModule {}
