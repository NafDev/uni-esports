import { Module } from '@nestjs/common';
import { CsgoModule } from './csgo/csgo.module';
import { MatchOrchestrationService } from './match-orchestration.service';
import { SteamModule } from './steam/steam.module';

@Module({
	providers: [MatchOrchestrationService],
	exports: [MatchOrchestrationService],
	imports: [CsgoModule, SteamModule]
})
export class MatchOrchestrationModule {}
