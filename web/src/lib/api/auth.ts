import SuperTokens from 'supertokens-website';
import type {
	ICreateUserDto,
	IEmailDto,
	IUserInfoDto,
	IUserLoginDto
} from '@uni-esports/interfaces';
import { HttpMethod, makeRequest } from './http';
import { goto } from '$app/navigation';
import { pushNotification } from '$lib/stores/notifications.store';
import { isSignedIn } from '$lib/stores/auth.store';

export async function signIn(body: IUserLoginDto, redirectOnSuccess?: string | URL) {
	const res = await makeRequest<IEmailDto>(HttpMethod.POST, { url: '/auth/signin', body });
	if (!res) return;

	if (redirectOnSuccess) {
		await goto(redirectOnSuccess);
	}
}

export async function signUp(body: ICreateUserDto, redirectOnSuccess?: string | URL) {
	const res = await makeRequest<void>(HttpMethod.POST, { url: '/users/create', body });
	if (res && redirectOnSuccess) {
		pushNotification({
			heading: 'Account created',
			message: 'Check your inbox to verify your account',
			type: 'success'
		});
		await goto(redirectOnSuccess);
	}
}

export async function signOut() {
	await SuperTokens.signOut();
	await goto('/');
}

export async function resendVerificationEmail() {
	const res = await makeRequest<void>(HttpMethod.POST, {
		url: '/user/email/verify/token',
		config: { headers: { rid: 'emailverification' } }
	});

	if (res) {
		pushNotification({
			message: 'Sent a new email. Please check your inbox or spam/junk folder',
			type: 'success'
		});
	}
}

export async function verifyEmail(token: string) {
	const res = await makeRequest<{ status: 'OK' | 'EMAIL_VERIFICATION_INVALID_TOKEN_ERROR' }>(
		HttpMethod.POST,
		{
			url: '/user/email/verify',
			body: { method: 'token', token },
			config: {
				headers: { rid: 'emailverification' }
			}
		},
		true
	);

	if (res && res.data.status === 'EMAIL_VERIFICATION_INVALID_TOKEN_ERROR') {
		return pushNotification({
			message: 'Invalid token',
			type: 'danger'
		});
	}

	pushNotification({
		message: 'Email successfully verified',
		type: 'success'
	});

	if (isSignedIn.get()) {
		await makeRequest<IUserInfoDto>(HttpMethod.GET, { url: '/users/me' });
		return await SuperTokens.attemptRefreshingSession();
	}
}
