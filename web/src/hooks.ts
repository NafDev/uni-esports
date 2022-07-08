import type { RequestEvent } from '@sveltejs/kit';
import * as cookie from 'cookie';

export function getSession(event: RequestEvent): App.Session {
	const cookies = cookie.parse(event.request.headers.get('cookie') || '');

	if (!cookies || !cookies['sFrontToken']) return {};

	const payload = JSON.parse(Buffer.from(cookies['sFrontToken'], 'base64').toString());

	return {
		user: payload.up
	};
}
