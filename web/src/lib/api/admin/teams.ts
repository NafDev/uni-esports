import { pushNotification } from '$lib/stores/notifications';
import type {
	ITeamListSearch,
	ITeamListSearchItem,
	Pagination,
	TeamListItemDto
} from '@uni-esports/interfaces';
import { makeRequest } from '../http';

export async function getPlayerTeams(userId: string) {
	const resp = await makeRequest<TeamListItemDto[]>('GET', `/admin/teams/users/${userId}`);

	if (resp) {
		return resp.json;
	}
}

export async function getAllTeams(page: number, query: ITeamListSearch) {
	const resp = await makeRequest<Pagination<ITeamListSearchItem>>(
		'POST',
		`/admin/teams/list?page=${page}`,
		query
	);

	if (resp) {
		return resp.json;
	}
}

export async function invitePlayerBySearch(teamId: number, userId: string) {
	const res = await makeRequest<void>('POST', `admin/teams/${teamId}/users/${userId}/invite`);

	if (res) {
		pushNotification({
			type: 'success',
			message: 'Sent team invite to player'
		});
	}
}

export async function addPlayerToTeam(teamId: number, userId: string) {
	const res = await makeRequest<void>('PATCH', `admin/teams/${teamId}/users/${userId}/join`);

	if (res) {
		pushNotification({
			type: 'success',
			message: 'Player added to team'
		});
	}
}

export async function removePlayerFromTeam(teamId: number, userId: string) {
	const res = await makeRequest<void>('PATCH', `admin/teams/${teamId}/users/${userId}/remove`);

	if (res) {
		pushNotification({
			type: 'success',
			message: 'Player removed from team'
		});
	}
}

export async function reassignPlayerAsCaptain(teamId: number, userId: string) {
	const res = await makeRequest<void>(
		'PATCH',
		`admin/teams/${teamId}/users/${userId}/assign-captain`
	);

	if (res) {
		pushNotification({
			type: 'success',
			message: 'Team captain reassigned'
		});
	}
}
