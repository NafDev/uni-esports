import { Module } from '@nestjs/common';
import { TeamController } from './teams.controller';
import { TeamService } from './teams.service';

@Module({
	providers: [TeamService],
	controllers: [TeamController],
	exports: [TeamService]
})
export class TeamModule {}
