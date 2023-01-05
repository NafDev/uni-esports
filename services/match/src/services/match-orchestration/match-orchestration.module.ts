import { Module } from '@nestjs/common';
import { OgmaModule } from '@ogma/nestjs-module';
import { CsgoModule } from './csgo/csgo.module';
import { MatchOrchestrationService } from './match-orchestration.service';
import { SteamModule } from './steam/steam.module';

@Module({
	providers: [MatchOrchestrationService],
	exports: [MatchOrchestrationService],
	imports: [CsgoModule, SteamModule, OgmaModule.forFeatures([MatchOrchestrationService])]
})
export class MatchOrchestrationModule {}
