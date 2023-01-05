import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import axios from 'axios';
import type { Request } from 'express';
import jsonWebToken, { JsonWebTokenError } from 'jsonwebtoken';
import jwkToPem from 'jwk-to-pem';
import type { getJWKS } from 'supertokens-node/recipe/session';
import appConfig from '../../config/app.config';

@Injectable()
export class JwtGuard implements CanActivate {
	private pems: string[] = [];

	constructor(private readonly scope: string) {
		void this.getPemCerts();
	}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request: Request = context.switchToHttp().getRequest();

		const token = request.headers.authorization;

		if (!token) {
			return false;
		}

		for (const cert of this.pems) {
			try {
				const decodedJWT = jsonWebToken.verify(token, cert);

				if (typeof decodedJWT === 'object' && decodedJWT.scope !== undefined && decodedJWT.scope === this.scope) {
					return true;
				}
			} catch (error: unknown) {
				if (error instanceof JsonWebTokenError) {
					continue;
				}

				throw error;
			}
		}

		return false;
	}

	async getPemCerts() {
		const certs = [];

		type Data = Awaited<ReturnType<typeof getJWKS>>;

		const resp = await axios.get<Data>(`${appConfig.ST_CORE_URL}/recipe/jwt/jwks`);

		if (resp.data.status === 'OK') {
			for (const key of resp.data.keys) {
				certs.push(jwkToPem(key as unknown as any));
			}

			this.pems = certs;
		}
	}
}
