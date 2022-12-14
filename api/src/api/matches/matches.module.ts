import { Module } from '@nestjs/common';
import { MatchService } from './matches.service';

@Module({
	controllers: [],
	providers: [MatchService]
})
export class MatchModule {}
