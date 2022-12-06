import { Body, Controller, Get, HttpCode, Param, ParseUUIDPipe, Post, Query, UseGuards } from '@nestjs/common';
import { Roles } from '../../../common/guards/roles/roles.decorator';
import { RolesGuard } from '../../../common/guards/roles/roles.guard';
import { ParsePositiveIntPipe } from '../../../common/pipes/positive-int.pipe';
import { AuthGuard } from '../../auth/auth.guard';
import { TeamService } from '../../teams/teams.service';
import { TeamListSearch } from './teams.admin.dto';

@Controller('admin/teams')
@UseGuards(AuthGuard, RolesGuard)
@Roles('ADMIN')
export class TeamController {
	constructor(private readonly teamsService: TeamService) {}

	@Get('/users/:id')
	async getPlayerTeams(@Param('id', ParseUUIDPipe) userId: string) {
		return this.teamsService.getTeamListByPlayer(userId);
	}

	@Post('list')
	@HttpCode(200)
	async getTeamsList(@Query('page', ParsePositiveIntPipe) page: number, @Body() searchQuery: TeamListSearch) {
		return this.teamsService.getTeamListBySearch(searchQuery, page);
	}
}
