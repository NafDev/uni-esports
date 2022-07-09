import type { RequestEvent } from '@sveltejs/kit';
import * as cookie from 'cookie';

export function getSession(event: RequestEvent): App.Session {
	const cookies = cookie.parse(event.request.headers.get('cookie') || '');

	if (!cookies || !cookies['sAccessToken']) return {};

	const b64data = decodeURIComponent(cookies['sAccessToken']).split('.').at(1);

	const payload = JSON.parse(Buffer.from(b64data, 'base64').toString());

	return {
		user: payload.userData
	};
}
