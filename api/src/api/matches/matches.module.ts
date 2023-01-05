import { Module } from '@nestjs/common';
import { OgmaModule } from '@ogma/nestjs-module';
import { MatchController } from './matches.controller';
import { MatchService } from './matches.service';

@Module({
	controllers: [MatchController],
	providers: [MatchService],
	exports: [MatchService],
	imports: [OgmaModule.forFeatures([MatchController, MatchService])]
})
export class MatchModule {}
