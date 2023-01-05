import { Module } from '@nestjs/common';
import { OgmaModule } from '@ogma/nestjs-module';
import { MatchOrchestrationModule } from '../match-orchestration/match-orchestration.module';
import { MatchSchedulingController } from './match-scheduling.controller';
import { MatchSchedulingService } from './match-scheduling.service';

@Module({
	controllers: [MatchSchedulingController],
	providers: [MatchSchedulingService],
	imports: [MatchOrchestrationModule, OgmaModule.forFeatures([MatchSchedulingController, MatchSchedulingService])]
})
export class MatchSchedulingModule {}
