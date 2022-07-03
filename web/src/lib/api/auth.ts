import SuperTokens from 'supertokens-website';
import type {
	AccessTokenPayload,
	ICreateUserDto,
	IEmailDto,
	IUserLoginDto
} from '@uni-esports/interfaces';
import { HttpMethod, makeRequest } from './http';
import { user } from '$lib/stores/auth.store';
import { goto } from '$app/navigation';

export async function login(body: IUserLoginDto, redirectOnSuccess?: string | URL) {
	const res = await makeRequest<IEmailDto>(HttpMethod.POST, { url: '/auth/login', body });
	console.log('auth.ts line 14', res);
	if (!res) return;

	const userId = await SuperTokens.getUserId();
	const tokenPayload: AccessTokenPayload = await SuperTokens.getAccessTokenPayloadSecurely();

	user.set({ id: userId, roles: tokenPayload.roles });

	console.log('auth.ts line 22');

	if (redirectOnSuccess) {
		console.log('auth.ts line 25');
		await goto(redirectOnSuccess);
	}
}

export async function signUp(body: ICreateUserDto, redirectOnSuccess?: string | URL) {
	const res = await makeRequest<void>(HttpMethod.POST, { url: '/users/create', body });
	if (res && redirectOnSuccess) {
		// TODO Notification "Account created"
		await goto(redirectOnSuccess);
	}
}

export async function signOut() {
	await SuperTokens.signOut();
	await goto('/');
}
