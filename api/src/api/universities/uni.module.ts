import { Module } from '@nestjs/common';
import { UniversityController } from './uni.controller';
import { UniversityService } from './uni.service';

@Module({
	imports: [],
	controllers: [UniversityController],
	providers: [UniversityService],
	exports: [UniversityService]
})
export class UniversityModule {}
