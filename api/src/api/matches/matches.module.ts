import { Module } from '@nestjs/common';
import { MatchService } from './matches.service';
import { MatchController } from './matches.controller';

@Module({
	controllers: [MatchController],
	providers: [MatchService],
	exports: [MatchService]
})
export class MatchModule {}
