import { goto } from '$app/navigation';
import { isSignedIn, user, userInfo } from '$lib/stores/auth';
import { pushNotification } from '$lib/stores/notifications';
import type {
	IEmailDto,
	INewPasswordDto,
	IPasswordResetDto,
	IUserInfoDto,
	IUserLoginDto,
	SteamOpenIdParameters
} from '@uni-esports/interfaces';
import SuperTokens from 'supertokens-website';
import { makeRequest } from './http';

export async function signIn(body: IUserLoginDto, redirectOnSuccess?: string | URL) {
	const res = await makeRequest<IEmailDto>('POST', '/auth/signin', body);
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
	// ST-exposed endpoint
	const res = await makeRequest<void>('POST', '/user/email/verify/token', {
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
		'POST',
		'/user/email/verify', // ST-exposed endpoint
		{ method: 'token', token },
		{
			config: { headers: { rid: 'emailverification' } }
		}
	);

	if (res && res.json.status === 'EMAIL_VERIFICATION_INVALID_TOKEN_ERROR') {
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
		await makeRequest<IUserInfoDto>('GET', '/users/me');
	}
}

export async function sendPasswordResetEmail(body: IEmailDto) {
	const res = await makeRequest<void>('POST', '/auth/password/reset', body);

	if (res) {
		pushNotification({
			message:
				'If an account exists with this email address, a password reset link has been sent to your inbox.',
			type: 'primary'
		});
	}
}

export async function performPasswordReset(body: IPasswordResetDto) {
	const res = await makeRequest<void>('POST', '/auth/password/reset/token', body);

	if (res) {
		pushNotification({
			message: 'Password reset successful. Please sign in again.',
			type: 'success'
		});
		goto('/users/signin');
	}
}

export async function performPasswordChange(body: INewPasswordDto) {
	const res = await makeRequest<void>('POST', '/auth/password/change', body);

	if (res) {
		pushNotification({
			message: 'Password successfully changed',
			type: 'success'
		});
	}

	return res;
}

export async function steamAuthRedirect() {
	const res = await makeRequest<{ url: string }>('GET', '/auth/steam/redirect');

	if (res) {
		goto(res.json.url);
	}
}

export async function steamAuthLink(body: SteamOpenIdParameters) {
	const res = await makeRequest<{ steam64Id: string }>('POST', '/auth/steam/link', body);

	if (res) {
		userInfo.setKey('steam64', res.json.steam64Id);
	}

	goto('/users/me');
}
