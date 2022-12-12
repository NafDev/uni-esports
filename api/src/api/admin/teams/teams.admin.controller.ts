import {
	Body,
	Controller,
	Get,
	HttpCode,
	Param,
	ParseUUIDPipe,
	Patch,
	Post,
	Query,
	Session,
	UseGuards
} from '@nestjs/common';
import type { SessionContainer } from 'supertokens-node/recipe/session';
import { Roles } from '../../../common/guards/roles/roles.decorator';
import { RolesGuard } from '../../../common/guards/roles/roles.guard';
import { ParsePositiveIntPipe } from '../../../common/pipes/positive-int.pipe';
import { AuthGuard } from '../../auth/auth.guard';
import { TeamService } from '../../teams/teams.service';
import { TeamListSearch } from './teams.admin.dto';
import { TeamAdminService } from './teams.admin.service';

@Controller('admin/teams')
@UseGuards(AuthGuard, RolesGuard)
@Roles('ADMIN')
export class TeamController {
	constructor(private readonly teamsService: TeamService, private readonly teamsAdminService: TeamAdminService) {}

	@Get('/users/:id')
	async getPlayerTeams(@Param('id', ParseUUIDPipe) userId: string) {
		return this.teamsService.getTeamListByPlayer(userId);
	}

	@Post('list')
	@HttpCode(200)
	async getTeamsList(@Query('page', ParsePositiveIntPipe) page: number, @Body() searchQuery: TeamListSearch) {
		return this.teamsService.getTeamListBySearch(searchQuery, page);
	}

	@Post(':teamId/users/:userId/invite')
	async inviteUser(
		@Param('teamId', ParsePositiveIntPipe) teamId: number,
		@Param('userId', ParseUUIDPipe) userId: string,
		@Session() session: SessionContainer
	) {
		return this.teamsAdminService.invitePlayer(teamId, userId, session);
	}

	@Patch(':teamId/users/:userId/join')
	async joinUserToTeam(
		@Param('teamId', ParsePositiveIntPipe) teamId: number,
		@Param('userId', ParseUUIDPipe) userId: string,
		@Session() session: SessionContainer
	) {
		return this.teamsAdminService.joinPlayerToTeam(teamId, userId, session);
	}

	@Patch(':teamId/users/:userId/remove')
	async removeUserFromTeam(
		@Param('teamId', ParsePositiveIntPipe) teamId: number,
		@Param('userId', ParseUUIDPipe) userId: string,
		@Session() session: SessionContainer
	) {
		return this.teamsAdminService.removePlayerFromTeam(teamId, userId, session);
	}

	@Patch(':teamId/users/:userId/assign-captain')
	async changeTeamCaptain(
		@Param('teamId', ParsePositiveIntPipe) teamId: number,
		@Param('userId', ParseUUIDPipe) userId: string,
		@Session() session: SessionContainer
	) {
		return this.teamsAdminService.changeCaptain(teamId, userId, session);
	}
}
