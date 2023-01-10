import { Buffer } from 'node:buffer';
import { Injectable } from '@nestjs/common';
import { OgmaLogger, OgmaService } from '@ogma/nestjs-module';
import { fetch, FormData, type Response } from 'undici';
import { AuthService } from '../../../auth/auth.service';
import appConfig from '../../../config/app.config';
import { createToken } from '../../../util/utility';
import { MatchOrchestrationError } from '../match-orchestration.error';
import { SteamService } from '../steam/steam.service';
import type { Match, Team } from './csgo.service';
import type { GameServer, MatchServerStart } from './dathost-api';

@Injectable()
export class CsgoServerService {
	constructor(
		@OgmaLogger(CsgoServerService) private readonly logger: OgmaService,
		private readonly steamService: SteamService,
		private readonly authService: AuthService
	) {}

	async startMatch(match: Match, team1: Team, team2: Team) {
		const { server, gameAccountDetails } = await this.createGameServer();

		await this.startMatchOnServer(match.id, { dathostServerId: server.id, map: match.map, team1, team2 });

		const passwdSuffix = server.csgo_settings.password.length > 0 ? `; password ${server.csgo_settings.password}` : '';

		const connectString = `connect ${server.raw_ip}:${server.ports.game}${passwdSuffix}`;

		return { connectString, serverId: server.id, gameAccountDetails };
	}

	async stopMatch(dathostServerId: string, steamGameServerId: string) {
		return this.stopAndCleanupMatchServer(dathostServerId, steamGameServerId);
	}

	private async startMatchOnServer(
		matchId: string,
		matchSettings: {
			dathostServerId: string;
			map: string;
			team1: {
				name: string;
				steam32Ids: string[];
			};
			team2: {
				name: string;
				steam32Ids: string[];
			};
		}
	) {
		const body = {
			connect_time: appConfig.CSGO_PLAYER_CONNECT_TIMEOUT,
			enable_knife_round: true,
			enable_pause: true,
			enable_tech_pause: true,
			game_server_id: matchSettings.dathostServerId,
			map: matchSettings.map,
			match_end_webhook_url: `${appConfig.API_DOMAIN}/webhooks/csgo/${matchId}/match-end`,
			round_end_webhook_url: `${appConfig.API_DOMAIN}/webhooks/csgo/${matchId}/round-end`,
			team_size: 5,
			team1_name: matchSettings.team1.name,
			team1_steam_ids: matchSettings.team1.steam32Ids,
			team2_name: matchSettings.team2.name,
			team2_steam_ids: matchSettings.team2.steam32Ids,
			wait_for_coaches: false,
			webhook_authorization_header: await this.authService.createJwt(2 * 60 * 60, 'dathost')
		};

		const resp = await this.makeRequest<MatchServerStart>('POST', '/api/0.1/matches', body);

		if (resp.status !== 'OK') {
			throw new MatchOrchestrationError('Unable to start match on server');
		}
	}

	private async createGameServer() {
		const resp = await this.makeRequest<GameServer>(
			'POST',
			`/api/0.1/game-servers/${appConfig.CSGO_DATHOST_BASE}/duplicate`
		);

		if (resp.status !== 'OK') {
			throw new MatchOrchestrationError('Unable to duplicate base DatHost server image');
		}

		const steamGameServer = await this.steamService.createCsgoServerToken();

		if (!steamGameServer) {
			throw new MatchOrchestrationError('Unable to create Steam game server token');
		}

		const serverToken = createToken(10);

		const updateServerDetails = {
			name: `UKUE_${serverToken}`,
			'csgo_settings.steam_game_server_login_token': steamGameServer.login_token
		};

		const updateServerToken = await this.makeRequest(
			'PUT',
			`/api/0.1/game-servers/${resp.body.id}`,
			updateServerDetails
		);

		if (updateServerToken.status !== 'OK') {
			throw new MatchOrchestrationError('Unable to update game server settings');
		}

		resp.body = { ...resp.body, ...updateServerDetails };

		return { server: resp.body, gameAccountDetails: steamGameServer };
	}

	private async stopAndCleanupMatchServer(dathostServerId: string, steamGameServerId: string) {
		const stopServer = await this.makeRequest('POST', `/api/0.1/game-servers/${dathostServerId}/stop`);

		if (stopServer.status === 'OK') {
			const deleteServer = await this.makeRequest('DELETE', `/api/0.1/game-servers/${dathostServerId}`);

			if (deleteServer.status !== 'OK') {
				this.logger.warn('Failed to delete DatHost server', {
					dathostServerId,
					apiResponse: { ...stopServer, headers: undefined }
				});
			}
		} else {
			this.logger.warn('Failed to stop DatHost server', {
				dathostServerId,
				apiResponse: { ...stopServer, headers: undefined }
			});
		}

		await this.steamService.deleteCsgoServerToken(steamGameServerId);
	}

	private async makeRequest<T>(
		method: HttpMethod,
		endpoint: `/api/0.1/${string}`,
		body?: Record<string, any>
	): Promise<Response | { status: 'OK'; body: T }> {
		const username = appConfig.CSGO_DATHOST_USERNAME;
		const password = appConfig.CSGO_DATHOST_PASSWORD;
		const headers = {
			authorization: `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`
		};

		let data: FormData | undefined;

		if (body && method !== 'GET') {
			data = new FormData();

			for (const [k, v] of Object.entries(body)) {
				data.append(k, v);
			}
		}

		if (body && method === 'GET') {
			this.logger.warn('Received body with GET request, ignoring body');
		}

		const resp = await fetch(`https://dathost.net${endpoint}`, { method, body: data, headers });

		if (resp.ok) {
			const body = (await resp.json()) as T;
			return { status: 'OK', body };
		}

		return resp;
	}
}
