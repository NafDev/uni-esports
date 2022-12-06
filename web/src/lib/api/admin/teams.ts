import type {
	ITeamListSearch,
	ITeamListSearchItem,
	Pagination,
	TeamListItemDto
} from '@uni-esports/interfaces';
import { HttpMethod, makeRequest } from '../http';

export async function getPlayerTeams(userId: string) {
	const resp = await makeRequest<TeamListItemDto[]>(
		HttpMethod.GET,
		{
			url: `/admin/teams/users/${userId}`
		},
		true
	);

	if (resp) {
		return resp.data;
	}
}

export async function getAllTeams(page: number, query: ITeamListSearch) {
	const resp = await makeRequest<Pagination<ITeamListSearchItem>>(
		HttpMethod.POST,
		{
			url: `/admin/teams/list?page=${page}`,
			body: query
		},
		true
	);

	if (resp) {
		return resp.data;
	}
}
