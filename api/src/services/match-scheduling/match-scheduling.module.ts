import { Module } from '@nestjs/common';
import { MatchModule } from '../../api/matches/matches.module';
import { MatchSchedulingController } from './match-scheduling.controller';

@Module({
	imports: [MatchModule],
	controllers: [MatchSchedulingController]
})
export class MatchSchedulingModule {}
