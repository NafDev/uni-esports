import { Module } from '@nestjs/common';
import { MatchSchedulingController } from './match-scheduling.controller';

@Module({
  controllers: [MatchSchedulingController]
})
export class MatchSchedulingModule {}
