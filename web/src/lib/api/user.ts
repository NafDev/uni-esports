import { authUser, getActiveUser } from '$lib/stores/auth.store';
import type { IUserLoginDto } from '../helpers/api-interfaces';
import { http } from './http';

export async function userLogin(body: IUserLoginDto) {
	const { email, password } = body;
	await http.post('auth/login', { email, password });

	authUser.set(await getActiveUser());
}

export async function userLogout() {
	await http.post('auth/logout');
	authUser.set(undefined);
}

export async function getUser() {
	return (await http.get('users/me')).data;
}
