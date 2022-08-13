import type { CreateTeamDto, InvitePlayerDto, TeamDto } from '@uni-esports/interfaces';
import { HttpMethod, makeRequest } from './http';
import { playerTeams } from '$lib/stores/teams.store';
import { pushNotification } from '$lib/stores/notifications.store';

export async function joinTeam(token: string) {
	const res = await makeRequest<TeamDto>(
		HttpMethod.PATCH,
		{ url: `/teams/join?token=${token}` },
		true
	);

	if (res) {
		playerTeams.set([...playerTeams.get(), res.data]);
	}
}

export async function createTeam(body: CreateTeamDto) {
	const res = await makeRequest<TeamDto>(HttpMethod.POST, { url: '/teams/create', body }, true);

	if (res) {
		playerTeams.set([...playerTeams.get(), res.data]);
	}
}

export async function getTeamById(body: { id: number }) {
	const res = await makeRequest<TeamDto>(HttpMethod.GET, { url: `/teams/${body.id}` }, true);

	if (res) {
		return res.data;
	}
}

export async function getTeamInviteCode(id: number) {
	const res = await makeRequest<{ inviteCode: string }>(HttpMethod.GET, {
		url: `/teams/${id}/invite-code`
	});

	if (res) {
		return res.data;
	}
}

export async function invitePlayerBySearch(teamId: number, body: InvitePlayerDto) {
	const res = await makeRequest<void>(
		HttpMethod.POST,
		{ url: `teams/${teamId}/invite`, body },
		true
	);

	if (res) {
		pushNotification({ type: 'success', message: 'Sent team invite to player' });
	}
}
