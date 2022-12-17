import { Module } from '@nestjs/common';
import { SchedulingPublisher } from './scheduling.publisher';
import { SchedulingService } from './scheduling.service';

@Module({
	providers: [SchedulingService, SchedulingPublisher]
})
export class SchedulingModule {}
