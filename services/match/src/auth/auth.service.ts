import { Injectable } from '@nestjs/common';
import supertokens from 'supertokens-node';
import jwt, { createJWT } from 'supertokens-node/recipe/jwt';
import appConfig from '../config/app.config';

@Injectable()
export class AuthService {
	constructor() {
		supertokens.init({
			appInfo: {
				apiDomain: appConfig.API_DOMAIN,
				appName: '',
				websiteDomain: appConfig.API_DOMAIN // Has no effect
			},
			supertokens: {
				connectionURI: appConfig.ST_CORE_URL
			},
			recipeList: [jwt.init()],
			telemetry: false
		});
	}

	async createJwt(validitySeconds: number, scope?: string) {
		const resp = await createJWT({ scope }, validitySeconds);

		if (resp.status === 'OK') {
			return resp.jwt;
		}

		throw new Error(resp.status);
	}
}
