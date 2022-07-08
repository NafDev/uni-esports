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
import { pushNotification } from '$lib/stores/notifications.store';

export async function signIn(body: IUserLoginDto, redirectOnSuccess?: string | URL) {
	const res = await makeRequest<IEmailDto>(HttpMethod.POST, { url: '/auth/signin', body });
	if (!res) return;

	const userId = await SuperTokens.getUserId();
	const tokenPayload: AccessTokenPayload = await SuperTokens.getAccessTokenPayloadSecurely();

	user.set({ id: userId, roles: tokenPayload.roles });

	if (redirectOnSuccess) {
		await goto(redirectOnSuccess);
	}
}

export async function signUp(body: ICreateUserDto, redirectOnSuccess?: string | URL) {
	const res = await makeRequest<void>(HttpMethod.POST, { url: '/users/create', body });
	if (res && redirectOnSuccess) {
		pushNotification({
			message: '<b>Account created</b>\nPlease login with your email and password',
			type: 'success'
		});
		await goto(redirectOnSuccess);
	}
}

export async function signOut() {
	await SuperTokens.signOut();
	await goto('/');
}
