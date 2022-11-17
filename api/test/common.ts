import supertest from 'supertest';
import he from 'he';
import type { Response } from 'superagent';
import mailhog from './scripts/mailhog';

const api = supertest('http://localhost:3000');
const apiUsers = supertest('http://localhost:3000/users');
const apiAuth = supertest('http://localhost:3000/auth');

/**
 * Response object can be used in assertions
 * ```
 * const [loginResp] = await createNewSession(...);
 * expect(loginResp.statusCode).toBe(201);
 * ```
 * The array is return of `resp.get('Set-Cookie)` can be used to save auth cookies
 * ```
 * const [, cookies] = await createNewSession(...)
 * const resp = await apiUsers.get('/me').set('Cookie', cookies).send();
 * ```
 */
export async function createNewSession(signInBody: { email: string; password: string }): Promise<[Response, string[]]> {
	const resp = await apiAuth.post('/signin').send(signInBody);

	const cookies = resp.get('Set-Cookie');

	return [resp, cookies];
}

export async function createNewVerifiedUser(userDetails: { email: string; password: string; username: string }) {
	const requestBody = userDetails;

	let resp = await apiUsers.post('/create').send(requestBody);
	expect(resp.statusCode).toBe(201);

	const mail = await mailhog.latestTo(userDetails.email);
	expect(mail).toBeTruthy();
	expect(mail?.subject).toBe('Verify your email');

	const rawHtml = he.decode(mail?.html ?? '');
	const token = /(?<=\/user\/verify-email\?token=)\w{128}/.exec(rawHtml)?.at(0);
	expect(token).toBeTruthy();

	// Different sub-base because it's a ST core exposed endpoint
	resp = await api.post('/user/email/verify').send({
		method: 'token',
		token
	});
	expect(resp.statusCode).toBe(200);
	expect(resp.body).toEqual({ status: 'OK' });
}
