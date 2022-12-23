import { Module } from '@nestjs/common';
import { CsgoModule } from './csgo/csgo.module';
import { MatchOrchestrationService } from './match-orchestration.service';

@Module({
	providers: [MatchOrchestrationService],
	exports: [MatchOrchestrationService],
	imports: [CsgoModule]
})
export class MatchOrchestrationModule {}
