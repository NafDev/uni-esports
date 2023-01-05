import { Module } from '@nestjs/common';
import { OgmaModule } from '@ogma/nestjs-module';
import { AuthModule } from '../../../auth/auth.module';
import { SteamModule } from '../steam/steam.module';
import { CsgoServerService } from './csgo-server.service';
import { CsgoController } from './csgo.controller';
import { CsgoService } from './csgo.service';

@Module({
	providers: [CsgoService, CsgoServerService],
	controllers: [CsgoController],
	imports: [AuthModule, SteamModule, OgmaModule.forFeatures([CsgoService, CsgoServerService, CsgoController])],
	exports: [CsgoService]
})
export class CsgoModule {}
