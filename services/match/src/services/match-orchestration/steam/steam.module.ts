import { Module } from '@nestjs/common';
import { OgmaModule } from '@ogma/nestjs-module';
import { SteamService } from './steam.service';

@Module({
	providers: [SteamService],
	exports: [SteamService],
	imports: [OgmaModule.forFeatures([SteamService])]
})
export class SteamModule {}
