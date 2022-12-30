import type { CreateTeamDto, InvitePlayerDto, TeamDto } from '@uni-esports/interfaces';
import { makeRequest } from './http';
import { playerTeams } from '$lib/stores/teams';
import { pushNotification } from '$lib/stores/notifications';

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
	const res = await makeRequest<TeamDto>('GET', `/teams/${body.id}`, undefined, { fetchWrapper });

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
