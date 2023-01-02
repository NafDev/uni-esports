import { Injectable, type OnApplicationBootstrap } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { fetch, type Response } from 'undici';
import { LoggerService } from '../../../common/logger-wrapper';
import appConfig, { CSGO_APP_ID } from '../../../config/app.config';
import { createToken } from '../../../util/utility';
import type { CreateAccountResponse, GetAccountListResponse } from './steam-game-servers-service';

@Injectable()
export class SteamService implements OnApplicationBootstrap {
	private readonly logger = new LoggerService(SteamService.name);

	onApplicationBootstrap() {
		void this.clearExpiredCsgoTokens();
	}

	async createCsgoServerToken() {
		this.logger.log('Creating CSGO game server account');

		const resp = await this.makeRequest<CreateAccountResponse>('POST', '/CreateAccount/v1/', {
			appid: 730,
			memo: 'csgo-' + createToken(10)
		});

		if (resp.status === 'OK') {
			return resp.body.response;
		}

		this.logger.warn('Failed to create CSGO game server account', { apiResponse: { ...resp, headers: undefined } });
	}

	async deleteCsgoServerToken(serverSteamId: string) {
		this.logger.log('Deleting CSGO game server account', { serverSteamId });

		const resp = await this.makeRequest<void>('POST', '/DeleteAccount/v1/', { steamid: serverSteamId });

		if (resp.status === 'OK') {
			return true;
		}

		this.logger.warn('Failed to delete CSGO game server account', { apiResponse: { ...resp, headers: undefined } });

		return false;
	}

	@Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
	private async clearExpiredCsgoTokens() {
		this.logger.log('Clearing expired CSGO game server tokens');

		const resp = await this.makeRequest<GetAccountListResponse>('GET', '/GetAccountList/v1/');

		if (resp.status !== 'OK') {
			this.logger.warn('Failed to fetch account list', { apiResponse: { ...resp, headers: undefined } });
			return;
		}

		if (resp.body.response.servers === undefined) {
			return;
		}

		for (const server of resp.body.response.servers) {
			if (server.appid === CSGO_APP_ID && server.is_expired) {
				void this.deleteCsgoServerToken(server.steamid);
			}
		}
	}

	// https://partner.steamgames.com/doc/webapi/IGameServersService
	private async makeRequest<T>(
		method: HttpMethod,
		endpoint: `/${string}/v1/`,
		data?: Record<string, any>
	): Promise<Response | { status: 'OK'; body: T }> {
		const headers = {
			'x-webapi-key': appConfig.STEAM_WEB_API_KEY
		};

		let inputJson = '';

		if (data) {
			inputJson = '?input_json=' + decodeURIComponent(JSON.stringify(data));
		}

		const resp = await fetch(`https://api.steampowered.com/IGameServersService${endpoint}${inputJson}`, {
			method,
			headers
		});

		if (resp.ok) {
			const body = (await resp.json()) as T;
			return { status: 'OK', body };
		}

		return resp;
	}
}
