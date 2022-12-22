import { Module } from '@nestjs/common';
import { CsgoService } from './csgo.service';

@Module({
	providers: [CsgoService],
	exports: [CsgoService]
})
export class CsgoModule {}
