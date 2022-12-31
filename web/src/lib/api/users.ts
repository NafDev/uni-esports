import { goto } from '$app/navigation';
import type { ICreateUserDto, IUserInfoDto, TeamDto } from '@uni-esports/interfaces';
import { pushNotification } from '../stores/notifications';
import { makeRequest } from './http';

export async function signUp(body: ICreateUserDto, redirectOnSuccess?: string | URL) {
	const res = await makeRequest<void>('POST', '/users/create', body);
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
	const res = await makeRequest<IUserInfoDto>('GET', '/users/me');

	if (res) {
		return res.json;
	}
}

export async function getUserTeams() {
	const res = await makeRequest<TeamDto[]>('GET', '/teams/me');

	if (res) {
		return res.json;
	}
}
