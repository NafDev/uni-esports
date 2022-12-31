import { pushNotification } from '$lib/stores/notifications';
import { stripEmptyStrings } from '$lib/util';
import type {
	ICreateNewMatch,
	IMatchListItem,
	IMatchSearchQuery,
	Pagination
} from '@uni-esports/interfaces';
import { makeRequest } from '../http';

export async function getMatchesList(page: number, filters: IMatchSearchQuery) {
	const res = await makeRequest<Pagination<IMatchListItem>>(
		'POST',
		`/admin/matches/list?page=${page}`,
		stripEmptyStrings(filters)
	);

	if (res) {
		return res.json;
	}
}

export async function createNewMatch(data: ICreateNewMatch) {
	const res = await makeRequest('POST', `/admin/matches/create`, data);

	if (res) {
		pushNotification({
			message: 'Created match',
			type: 'success'
		});
	}
}
