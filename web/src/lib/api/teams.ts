import { pushNotification } from '$lib/stores/notifications';
import { playerTeams } from '$lib/stores/teams';
import type {
	CreateTeamDto,
	InvitePlayerDto,
	ITeamResult,
	Pagination,
	TeamDto
} from '@uni-esports/interfaces';
import { makeRequest } from './http';

export async function joinTeam(token: string) {
	await makeRequest<TeamDto>('PATCH', `/teams/join?token=${token}`);
}

export async function createTeam(body: CreateTeamDto) {
	const res = await makeRequest<TeamDto>('POST', '/teams/create', body);

	if (res) {
		playerTeams.set([...playerTeams.get(), res.json]);
	}

	return Boolean(res);
}

export async function getTeamById(body: { id: number }, fetchWrapper?: typeof fetch) {
	const res = await makeRequest<TeamDto>('GET', `/teams/${body.id}`, undefined, {
		displayUiError: false,
		fetchWrapper
	});

	if (res) {
		return res.json;
	}
}

export async function getTeamInviteCode(id: number) {
	const res = await makeRequest<{ inviteCode: string }>('GET', `/teams/${id}/invite-code`);

	if (res) {
		return res.json;
	}
}

export async function invitePlayerBySearch(teamId: number, body: InvitePlayerDto) {
	const res = await makeRequest<void>('POST', `teams/${teamId}/invite`, body);

	if (res) {
		pushNotification({
			type: 'success',
			message: 'Sent team invite to player'
		});
	}
}

export async function getRecentResults(teamId: number, page: number, limit: number) {
	const res = await makeRequest<Pagination<ITeamResult>>(
		'GET',
		`teams/${teamId}/results?page=${page}&limit=${limit}`
	);

	if (res) {
		return res.json;
	}
}
