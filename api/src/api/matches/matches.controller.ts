import {
	Body,
	Controller,
	Get,
	Header,
	HttpCode,
	Param,
	ParseBoolPipe,
	ParseUUIDPipe,
	Post,
	Query,
	Session,
	Sse,
	UseGuards
} from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import type { MatchService as MatchServicePayload } from '@uni-esports/interfaces';
import type { SessionContainer } from 'supertokens-node/recipe/session';
import { AuthGuard } from '../auth/auth.guard';
import { AuthGuardNotRequired } from '../auth/auth.no-verify.guard';
import { VetoRequestBody } from './matches.dto';
import { MatchService } from './matches.service';

@Controller('matches')
export class MatchController {
	constructor(private readonly matchService: MatchService) {}

	@UseGuards(AuthGuardNotRequired)
	@Sse(':id/events')
	@Header('X-Accel-Buffering', 'no')
	async matchSetupEvents(@Param('id', ParseUUIDPipe) matchId: string, @Session() session: SessionContainer) {
		return this.matchService.matchEvents(matchId, session);
	}

	@UseGuards(AuthGuardNotRequired)
	@Get('upcoming')
	async getUpcomingMatches(
		@Session() session: SessionContainer,
		@Query('game') gameIdFilter: string,
		@Query('me', ParseBoolPipe) forSessionUserFilter: boolean
	) {
		return this.matchService.getUpcomingMatches(session, gameIdFilter, forSessionUserFilter);
	}

	@UseGuards(AuthGuardNotRequired)
	@Get(':id')
	async getMatchInfo(@Param('id', ParseUUIDPipe) id: string, @Session() session: SessionContainer) {
		return this.matchService.getMatchInfo(id, session);
	}

	@Get(':id/veto/status')
	async getVetoStatus(@Param('id', ParseUUIDPipe) matchId: string) {
		return this.matchService.fetchVetoStatus(matchId);
	}

	@UseGuards(AuthGuard)
	@HttpCode(202)
	@Post(':id/veto/request')
	async sendVetoRequest(
		@Param('id', ParseUUIDPipe) matchId: string,
		@Body() body: VetoRequestBody,
		@Session() session: SessionContainer
	) {
		return this.matchService.validateAndSendUserVetoRequest(
			{
				matchId,
				teamId: body.teamId,
				veto: body.veto,
				gameId: body.gameId
			},
			session
		);
	}

	@EventPattern('match.server.start')
	matchServerStartedEvent(@Payload() data: MatchServicePayload['match.server.start']) {
		this.matchService.broadcastMatchEvent(
			data.matchId,
			{
				type: 'match_server',
				data: {
					...data,
					matchId: undefined
				}
			},
			true
		);
	}

	@EventPattern(`match.veto.start`)
	vetoStartEvent(@Payload() data: MatchServicePayload['match.veto.start']) {
		this.matchService.broadcastMatchEvent(data.matchId, {
			type: 'veto_start',
			data: {
				...data,
				matchId: undefined
			}
		});
	}

	@EventPattern(`match.veto.update`)
	vetoUpdateEvent(@Payload() data: MatchServicePayload['match.veto.update']) {
		this.matchService.broadcastMatchEvent(data.matchId, {
			type: 'veto_update',
			data: {
				...data,
				matchId: undefined
			}
		});
	}

	@EventPattern('match.veto.result')
	vetoResultEvent(@Payload() data: MatchServicePayload['match.veto.result']) {
		this.matchService.broadcastMatchEvent(data.matchId, {
			type: 'veto_result',
			data: data.result
		});
	}
}
