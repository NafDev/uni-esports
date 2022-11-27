import { goto } from '$app/navigation';
import type { ICreateUserDto, IUserInfoDto, TeamDto } from '@uni-esports/interfaces';
import { pushNotification } from '../stores/notifications';
import { makeRequest, HttpMethod } from './http';

export async function signUp(body: ICreateUserDto, redirectOnSuccess?: string | URL) {
	const res = await makeRequest<void>(HttpMethod.POST, {
		url: '/users/create',
		body
	});
	if (res) {
		pushNotification({
			heading: 'Account created',
			message: 'Check your inbox to verify your account',
			type: 'success'
		});
	}

	if (redirectOnSuccess) {
		goto(redirectOnSuccess);
	}
}

export async function getUserInfo() {
	const res = await makeRequest<IUserInfoDto>(HttpMethod.GET, { url: '/users/me' }, true);

	if (res) {
		return res.data;
	}
}

export async function getUserTeams() {
	const res = await makeRequest<TeamDto[]>(HttpMethod.GET, { url: '/teams/me' }, true);

	if (res) {
		return res.data;
	}
}
