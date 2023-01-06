import { getRecentResults, getTeamById } from '$lib/api/teams';
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, fetch, parent, depends }) => {
	const { userStore } = await parent();

	const teamData = await getTeamById(
		{
			id: params.id as unknown as number
		},
		fetch
	);

	if (!teamData) {
		throw error(404);
	}

	let isCaptain: boolean | undefined;
	let isTeamMember: boolean | undefined;

	if (userStore?.id) {
		isCaptain = userStore.id === teamData.members.find((a) => a.captain)?.id;
		isTeamMember = Boolean(teamData.members.find((a) => a.id === userStore.id));
	}

	teamData.members = teamData.members.sort((a) => (a.captain ? 0 : 1));
	const team = teamData;

	const teamResults = await getRecentResults(params.id as unknown as number, 1, 5, fetch);

	return {
		team,
		isCaptain,
		isTeamMember,
		teamResults
	};
};
