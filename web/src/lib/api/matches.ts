import type { IMatchInfo, GameListItem } from '@uni-esports/interfaces';
import { HttpMethod, makeRequest } from './http';

export async function getGamesList() {
	const res = await makeRequest<GameListItem[]>(HttpMethod.GET, { url: '/games/list' }, false);

	if (res) {
		return res.data;
	}
}

export async function getMatchInfo(id: string) {
	const res = await makeRequest<IMatchInfo>(HttpMethod.GET, {
		url: `/matches/${id}`
	});

	if (res) {
		return res.data;
	}
}
