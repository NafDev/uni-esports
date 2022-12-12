import { browser } from '$app/environment';
import { goto } from '$app/navigation';
import { getTeamById } from '$lib/api/teams';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, depends }) => {
	depends('data:team');

	if (browser) {
		try {
			const teamData = await getTeamById({
				id: params.id as unknown as number
			});

			if (!teamData) {
				await goto('/admin/teams/list');
			}

			teamData.members = teamData.members.sort((a) => (a.captain ? 0 : 1));
			const team = teamData;

			return { team };
		} catch (error) {
			return {};
		}
	}
};
