import { Module } from '@nestjs/common';
import { OgmaModule } from '@ogma/nestjs-module';
import { MatchOrchestrationModule } from '../match-orchestration/match-orchestration.module';
import { VetoController } from './veto.controller';
import { VetoService } from './veto.service';

@Module({
	controllers: [VetoController],
	providers: [VetoService],
	imports: [MatchOrchestrationModule, OgmaModule.forFeatures([VetoService, VetoController])]
})
export class VetoModule {}
