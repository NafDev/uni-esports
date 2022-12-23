import { Module } from '@nestjs/common';
import { GameModule } from '../../games/games.module';
import { AdminMatchController } from './matches.controller';
import { AdminMatchService } from './matches.service';

@Module({
	controllers: [AdminMatchController],
	providers: [AdminMatchService],
	imports: [GameModule]
})
export class AdminMatchModule {}
