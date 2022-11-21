import type { AccessTokenPayload } from '@uni-esports/interfaces';
import type { LayoutData } from './$types';

import SuperTokens from 'supertokens-website';
import { browser, dev } from '$app/environment';

import { BASE_API_URL } from '$/lib/config';
import { user } from '$/lib/stores/auth.store';

export const load: LayoutData = async () => {
	if (browser) {
		SuperTokens.init({
			apiDomain: BASE_API_URL,
			apiBasePath: '/',
			autoAddCredentials: true,
			sessionExpiredStatusCode: 511,
			onHandleEvent: async (event) => {
				switch (event.action) {
					case 'SESSION_CREATED':
					case 'ACCESS_TOKEN_PAYLOAD_UPDATED':
					case 'REFRESH_SESSION': {
						console.log(event.action);
						console.debug();
						const userId = await SuperTokens.getUserId();
						const tokenPayload: AccessTokenPayload =
							await SuperTokens.getAccessTokenPayloadSecurely();

						user.set({ id: userId, ...tokenPayload });
						break;
					}
				}
			}
		});

		try {
			const id = await SuperTokens.getUserId();
			const payload: AccessTokenPayload = await SuperTokens.getAccessTokenPayloadSecurely();
			user.set({ ...payload, id });
		} catch (error) {
			if (dev) {
				console.warn(error);
			}
		}
	}
	return {};
};
