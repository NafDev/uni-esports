import { pushNotification } from '$lib/stores/notifications';
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

export async function invitePlayerBySearch(teamId: number, userId: string) {
	const res = await makeRequest<void>(
		HttpMethod.POST,
		{ url: `admin/teams/${teamId}/users/${userId}/invite` },
		true
	);

	if (res) {
		pushNotification({
			type: 'success',
			message: 'Sent team invite to player'
		});
	}
}

export async function addPlayerToTeam(teamId: number, userId: string) {
	const res = await makeRequest<void>(
		HttpMethod.PATCH,
		{ url: `admin/teams/${teamId}/users/${userId}/join` },
		true
	);

	if (res) {
		pushNotification({
			type: 'success',
			message: 'Player added to team'
		});
	}
}
