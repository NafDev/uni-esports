import { pushNotification } from '$lib/stores/notifications';
import type { IUserDetails, IUserFilters, IUsers, Pagination } from '@uni-esports/interfaces';
import { HttpMethod, makeRequest } from '../http';

export async function getAllUsers(page: number, filters?: IUserFilters) {
	const res = await makeRequest<Pagination<IUsers>>(
		HttpMethod.POST,
		{ url: `/admin/users/list?page=${page}`, body: filters },
		true
	);

	if (res) {
		return res.data;
	}
}

export async function getUser(uuid: string) {
	const res = await makeRequest<IUserDetails>(
		HttpMethod.GET,
		{ url: `/admin/users/${uuid}` },
		true
	);

	if (res) {
		return res.data;
	}
}

export async function updateUserEmail(uuid: string, newEmail: string) {
	const res = await makeRequest<void>(
		HttpMethod.PATCH,
		{ url: `/admin/users/${uuid}/email/update`, body: { email: newEmail } },
		true
	);

	if (res) {
		pushNotification({
			message: 'Updated email and sent verification email to user',
			type: 'success'
		});
	}
}

export async function updateUsername(uuid: string, newUsername: string) {
	const res = await makeRequest<void>(
		HttpMethod.PATCH,
		{ url: `/admin/users/${uuid}/username/update`, body: { username: newUsername } },
		true
	);

	if (res) {
		pushNotification({
			message: 'Updated username',
			type: 'success'
		});
	}
}

export async function unlinkSteamId(userId: string) {
	const res = await makeRequest<void>(
		HttpMethod.PATCH,
		{ url: `/admin/users/${userId}/steam/remove` },
		true
	);

	if (res) {
		pushNotification({
			message: "Unlinked Steam ID from user's account",
			type: 'success'
		});
	}
}
