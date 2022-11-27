import { browser } from '$app/environment';
import { getTeamById } from '$lib/api/teams';
import { user } from '$lib/stores/auth';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
	if (browser) {
		try {
			const teamData = await getTeamById({
				id: params.page as unknown as number
			});

			const isCaptain = user.get().id === teamData.members.find((a) => a.captain).id;
			const isTeamMember = Boolean(teamData.members.find((a) => a.id === user.get().id));

			teamData.members = teamData.members.sort((a) => (a.captain ? 0 : 1));
			const team = teamData;

			return { isCaptain, isTeamMember, team };
		} catch (error) {
			return {};
		}
	}
};
