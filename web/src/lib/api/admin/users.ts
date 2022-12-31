import { pushNotification } from '$lib/stores/notifications';
import { stripEmptyStrings } from '$lib/util';
import type { IUserDetails, IUserFilters, IUsers, Pagination } from '@uni-esports/interfaces';
import { makeRequest } from '../http';

export async function getAllUsers(page: number, filters?: IUserFilters) {
	const res = await makeRequest<Pagination<IUsers>>(
		'POST',
		`/admin/users/list?page=${page}`,
		stripEmptyStrings(filters)
	);

	if (res) {
		return res.json;
	}
}

export async function getUser(uuid: string) {
	const res = await makeRequest<IUserDetails>('GET', `/admin/users/${uuid}`);

	if (res) {
		return res.json;
	}
}

export async function updateUserEmail(uuid: string, newEmail: string) {
	const res = await makeRequest<void>('PATCH', `/admin/users/${uuid}/email/update`, {
		email: newEmail
	});

	if (res) {
		pushNotification({
			message: 'Updated email and sent verification email to user',
			type: 'success'
		});
	}
}

export async function updateUsername(uuid: string, newUsername: string) {
	const res = await makeRequest<void>('PATCH', `/admin/users/${uuid}/username/update`, {
		username: newUsername
	});

	if (res) {
		pushNotification({
			message: 'Updated username',
			type: 'success'
		});
	}
}

export async function unlinkSteamId(userId: string) {
	const res = await makeRequest<void>('PATCH', `/admin/users/${userId}/steam/remove`);

	if (res) {
		pushNotification({
			message: "Unlinked Steam ID from user's account",
			type: 'success'
		});
	}
}
