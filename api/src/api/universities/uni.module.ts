import { Module } from '@nestjs/common';
import { OgmaModule } from '@ogma/nestjs-module';
import { UniversityController } from './uni.controller';
import { UniversityService } from './uni.service';

@Module({
	imports: [OgmaModule.forFeatures([UniversityController, UniversityService])],
	controllers: [UniversityController],
	providers: [UniversityService],
	exports: [UniversityService]
})
export class UniversityModule {}
