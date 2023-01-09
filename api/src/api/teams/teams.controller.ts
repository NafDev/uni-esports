import {
	Body,
	Controller,
	Get,
	Param,
	ParseIntPipe,
	ParseUUIDPipe,
	Patch,
	Post,
	Query,
	Session,
	UseGuards
} from '@nestjs/common';
import type { SessionContainer } from 'supertokens-node/recipe/session';
import { VerifiedGuard } from '../../common/guards/user/verified.guard';
import { ParsePositiveIntPipe } from '../../common/pipes/positive-int.pipe';
import { AuthGuard } from '../auth/auth.guard';
import { CreateTeamDto, InvitePlayerDto } from './teams.dto';
import { TeamService } from './teams.service';

@Controller('teams')
export class TeamController {
	constructor(private readonly teamsService: TeamService) {}

	@Get('me')
	@UseGuards(AuthGuard)
	async getPlayerTeams(@Session() session: SessionContainer) {
		return this.teamsService.findTeamsByPlayer(session.getUserId());
	}

	@Get(':id')
	async getTeam(@Param('id', ParseIntPipe) id: number) {
		return this.teamsService.getTeam(id);
	}

	@Get(':id/results')
	async getRecentMatchResults(
		@Param('id', ParsePositiveIntPipe) teamId: number,
		@Query('page', ParsePositiveIntPipe) page: number,
		@Query('limit', ParsePositiveIntPipe) limit: number
	) {
		return this.teamsService.getTeamResults(teamId, page, limit);
	}

	@UseGuards(AuthGuard, VerifiedGuard)
	@Post(':teamId/invite')
	async invitePlayerBySearch(
		@Param('teamId', ParseIntPipe) teamId: number,
		@Body() inviteBySearch: InvitePlayerDto,
		@Session() session: SessionContainer
	) {
		return this.teamsService.invitePlayerBySearch(teamId, inviteBySearch, session);
	}

	@UseGuards(AuthGuard, VerifiedGuard)
	@Get(':id/invite-code')
	async getInviteToken(@Param('id', ParseIntPipe) id: number, @Session() session: SessionContainer) {
		return this.teamsService.getTeamInviteCode(id, session);
	}

	@UseGuards(AuthGuard, VerifiedGuard)
	@Patch(':id/invite-code')
	async regenerateInviteToken(@Param('id', ParseIntPipe) id: number, @Session() session: SessionContainer) {
		return this.teamsService.regenerateInviteCode(id, session);
	}

	@Get('university/:id')
	async getTeamsByUniversity(
		@Param('id', ParseIntPipe) uniId: number,
		@Query('page', ParsePositiveIntPipe) page: number
	) {
		return this.teamsService.findTeamsByUni(uniId, page);
	}

	@Post('create')
	@UseGuards(AuthGuard, VerifiedGuard)
	async createTeam(@Body() body: CreateTeamDto, @Session() session: SessionContainer) {
		return this.teamsService.createTeam(body, session);
	}

	@Patch('join')
	@UseGuards(AuthGuard, VerifiedGuard)
	async joinTeam(@Query('token') token: string, @Session() session: SessionContainer) {
		return this.teamsService.joinPlayerOnTeam(token, session);
	}

	@Patch(':teamId/users/:userId/remove')
	@UseGuards(AuthGuard)
	async removeUserFromTeam(
		@Param('teamId', ParseIntPipe) teamId: number,
		@Param('userId', ParseUUIDPipe) userId: string,
		@Session() session: SessionContainer
	) {
		return this.teamsService.removePlayerOnTeam(teamId, userId, session);
	}
}
