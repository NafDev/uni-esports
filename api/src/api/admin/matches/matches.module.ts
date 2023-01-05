import { Module } from '@nestjs/common';
import { OgmaModule } from '@ogma/nestjs-module';
import { GameModule } from '../../games/games.module';
import { AdminMatchController } from './matches.controller';
import { AdminMatchService } from './matches.service';

@Module({
	controllers: [AdminMatchController],
	providers: [AdminMatchService],
	imports: [GameModule, OgmaModule.forFeatures([AdminMatchController, AdminMatchService])]
})
export class AdminMatchModule {}
