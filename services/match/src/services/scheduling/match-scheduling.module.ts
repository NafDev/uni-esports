import { Module } from '@nestjs/common';
import { MatchSchedulingPublisher } from './match-scheduling.publisher';
import { MatchSchedulingService } from './match-scheduling.service';

@Module({
	providers: [MatchSchedulingService, MatchSchedulingPublisher]
})
export class MatchSchedulingModule {}
