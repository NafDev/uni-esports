import { Module } from '@nestjs/common';
import { MatchOrchestrationModule } from '../match-orchestration/match-orchestration.module';
import { MatchSchedulingController } from './match-scheduling.controller';
import { MatchSchedulingService } from './match-scheduling.service';

@Module({
	controllers: [MatchSchedulingController],
	providers: [MatchSchedulingService],
	imports: [MatchOrchestrationModule]
})
export class MatchSchedulingModule {}
