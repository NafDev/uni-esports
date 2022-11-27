import SuperTokens from 'supertokens-website';
import type {
	IEmailDto,
	INewPasswordDto,
	IPasswordResetDto,
	IUserInfoDto,
	IUserLoginDto,
	SteamOpenIdParameters
} from '@uni-esports/interfaces';
import { HttpMethod, makeRequest } from './http';
import { goto } from '$app/navigation';
import { pushNotification } from '$lib/stores/notifications';
import { isSignedIn, user, userInfo } from '$lib/stores/auth';
import type { Cookies } from '@sveltejs/kit';

export async function checkSession(cookies: Cookies): Promise<boolean> {
	const res = await makeRequest(HttpMethod.GET, {
		url: '/session',
		config: { headers: { Cookie: cookies.serialize('sAccessToken', cookies.get('sAccessToken')) } }
	});

	return Boolean(res);
}

export async function signIn(body: IUserLoginDto, redirectOnSuccess?: string | URL) {
	const res = await makeRequest<IEmailDto>(HttpMethod.POST, {
		url: '/auth/signin',
		body
	});
	if (!res) return;

	if (redirectOnSuccess) {
		goto(redirectOnSuccess, { replaceState: true });
	}
}

export async function signOut() {
	await SuperTokens.signOut();
	user.set(undefined);
}

export async function resendVerificationEmail() {
	const res = await makeRequest<void>(HttpMethod.POST, {
		url: '/user/email/verify/token', // ST-exposed endpoint
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
	const res = await makeRequest<{
		status: 'OK' | 'EMAIL_VERIFICATION_INVALID_TOKEN_ERROR';
	}>(
		HttpMethod.POST,
		{
			url: '/user/email/verify', // ST-exposed endpoint
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

	if (res) {
		pushNotification({
			message: 'Email successfully verified',
			type: 'success'
		});
	}

	if (isSignedIn.get()) {
		await makeRequest<IUserInfoDto>(HttpMethod.GET, { url: '/users/me' });
	}
}

export async function sendPasswordResetEmail(body: IEmailDto) {
	const res = await makeRequest<void>(HttpMethod.POST, { url: '/auth/password/reset', body }, true);

	if (res) {
		pushNotification({
			message:
				'If an account exists with this email address, a password reset link has been sent to your inbox.',
			type: 'primary'
		});
	}
}

export async function performPasswordReset(body: IPasswordResetDto) {
	const res = await makeRequest<void>(
		HttpMethod.POST,
		{ url: '/auth/password/reset/token', body },
		true
	);

	if (res) {
		pushNotification({
			message: 'Password reset successful. Please sign in again.',
			type: 'success'
		});
		goto('/users/signin');
	}
}

export async function performPasswordChange(body: INewPasswordDto) {
	const res = await makeRequest<void>(
		HttpMethod.POST,
		{ url: '/auth/password/change', body },
		true
	);

	if (res) {
		pushNotification({
			message: 'Password successfully changed',
			type: 'success'
		});
	}

	return res;
}

export async function steamAuthRedirect() {
	const res = await makeRequest<{ url: string }>(
		HttpMethod.GET,
		{ url: '/auth/steam/redirect' },
		true
	);

	if (res) {
		goto(res.data.url);
	}
}

export async function steamAuthLink(body: SteamOpenIdParameters) {
	const res = await makeRequest<{ steam64Id: string }>(
		HttpMethod.POST,
		{ url: '/auth/steam/link', body },
		true
	);

	if (res) {
		userInfo.setKey('steam64', res.data.steam64Id);
	}

	goto('/users/me');
}
