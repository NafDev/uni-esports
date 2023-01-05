import { Module } from '@nestjs/common';
import { OgmaModule } from '@ogma/nestjs-module';
import { TeamController } from './teams.controller';
import { TeamService } from './teams.service';

@Module({
	providers: [TeamService],
	controllers: [TeamController],
	exports: [TeamService],
	imports: [OgmaModule.forFeatures([TeamService, TeamController])]
})
export class TeamModule {}
