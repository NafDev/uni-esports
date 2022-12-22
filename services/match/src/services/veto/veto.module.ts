import { Module } from '@nestjs/common';
import { MatchOrchestrationModule } from '../match-orchestration/match-orchestration.module';
import { VetoController } from './veto.controller';
import { VetoService } from './veto.service';

@Module({
	controllers: [VetoController],
	providers: [VetoService],
	imports: [MatchOrchestrationModule]
})
export class VetoModule {}
