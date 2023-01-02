import { getMatchInfo, getVetoStatus } from '$lib/api/matches';
import { getTeamById } from '$lib/api/teams';
import { error } from '@sveltejs/kit';
import type { IMatchDetailsCsgo, TeamDto, TeamMemberDto } from '@uni-esports/interfaces';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, params }) => {
	const matchId = params.id;

	type MatchStatus =
		| 'Match scheduled'
		| 'Match in progress'
		| 'Match complete'
		| 'Match cancelled'
		| 'Veto in progress';

	type MatchDetails = Omit<IMatchDetailsCsgo, 'teams'> & {
		status: MatchStatus;
		teams: Array<IMatchDetailsCsgo['teams'][number] & TeamDto & { members: TeamMemberDto[] }>;
		vetoOngoing: boolean;
		vetoStatus?: { vetoed: string[]; teamId: number; time: string };
	};

	const matchInfo = (await getMatchInfo(matchId, fetch)) as IMatchDetailsCsgo;

	if (!matchInfo || matchInfo.teams?.length < 2) {
		throw error(404);
	}

	const props = { ...matchInfo } as unknown as MatchDetails;

	props.startTime = new Date(matchInfo.startTime);

	switch (matchInfo.status) {
		case 'Scheduled':
			props.status = 'Match scheduled';
			break;
		case 'Setup':
			props.status = 'Veto in progress';
			break;
		case 'Ongoing':
			props.status = 'Match in progress';
			break;
		case 'Completed':
			props.status = 'Match complete';
			break;
		case 'Cancelled':
			props.status = 'Match cancelled';
			break;
	}

	props.teams = [];

	await Promise.all(
		matchInfo.teams.map(async (team) => {
			const teamData = await getTeamById({ id: team.id }, fetch);

			teamData.members.sort((a) => (a.captain ? -1 : 1));
			props.teams.push({ ...teamData, teamNumber: team.teamNumber });
		})
	);

	if (!props.map) {
		const veto = await getVetoStatus(matchId, fetch);

		if (veto.status !== 'Ongoing') {
			props.vetoOngoing = false;
		} else {
			props.status = 'Veto in progress';
			props.vetoOngoing = true;
			props.vetoStatus = veto;
		}
	}

	return { ...props };
};
