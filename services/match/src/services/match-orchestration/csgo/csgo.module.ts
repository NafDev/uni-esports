import { Module } from '@nestjs/common';
import { AuthModule } from '../../../auth/auth.module';
import { SteamModule } from '../steam/steam.module';
import { CsgoServerService } from './csgo-server.service';
import { CsgoController } from './csgo.controller';
import { CsgoService } from './csgo.service';

@Module({
	providers: [CsgoService, CsgoServerService],
	imports: [AuthModule, SteamModule],
	exports: [CsgoService],
	controllers: [CsgoController]
})
export class CsgoModule {}
