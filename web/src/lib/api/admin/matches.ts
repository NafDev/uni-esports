import { pushNotification } from '$lib/stores/notifications';
import { stripEmptyStrings } from '$lib/util';
import type {
	ICreateNewMatch,
	IMatchListItem,
	IMatchSearchQuery,
	Pagination
} from '@uni-esports/interfaces';
import { HttpMethod, makeRequest } from '../http';

export async function getMatchesList(page: number, filters: IMatchSearchQuery) {
	const res = await makeRequest<Pagination<IMatchListItem>>(HttpMethod.POST, {
		url: `/admin/matches/list?page=${page}`,
		body: stripEmptyStrings(filters)
	});

	if (res) {
		return res.data;
	}
}

export async function createNewMatch(data: ICreateNewMatch) {
	const res = await makeRequest(HttpMethod.POST, {
		url: `/admin/matches/create`,
		body: data
	});

	if (res) {
		pushNotification({
			message: 'Created match',
			type: 'success'
		});
	}
}
