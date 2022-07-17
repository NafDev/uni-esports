import { goto } from '$app/navigation';
import type { ICreateUserDto, IUserInfoDto } from '@uni-esports/interfaces';
import { pushNotification } from '../stores/notifications.store';
import { makeRequest, HttpMethod } from './http';

export async function signUp(body: ICreateUserDto, redirectOnSuccess?: string | URL) {
	const res = await makeRequest<void>(HttpMethod.POST, { url: '/users/create', body });
	if (res && redirectOnSuccess) {
		pushNotification({
			heading: 'Account created',
			message: 'Check your inbox to verify your account',
			type: 'success'
		});
		goto(redirectOnSuccess);
	}
}

export async function getUserInfo() {
	const res = await makeRequest<IUserInfoDto>(HttpMethod.GET, { url: '/users/me' }, true);

	if (res) {
		return res.data;
	}
}
