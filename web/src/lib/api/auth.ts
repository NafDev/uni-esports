import SuperTokens from 'supertokens-website';
import type { AccessTokenPayload, IEmailDto, IUserLoginDto } from '@uni-esports/interfaces';
import { HttpMethod, makeRequest } from './http';
import { user } from '$lib/stores/auth.store';

export function login(body: IUserLoginDto) {
	return makeRequest<IEmailDto>(HttpMethod.POST, { url: '/auth/login', body }, true).then(
		async (res) => {
			const userId = await SuperTokens.getUserId();
			const tokenPayload: AccessTokenPayload = await SuperTokens.getAccessTokenPayloadSecurely();

			user.set({ id: userId, email: res.data.email, roles: tokenPayload.roles });

			return user.get();
		}
	);
}
