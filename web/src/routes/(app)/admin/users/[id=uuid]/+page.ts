import { browser } from '$app/environment';
import { getPlayerTeams } from '$lib/api/admin/teams';
import { getUser } from '$lib/api/admin/users';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
	if (browser) {
		const [userDetails, userTeams] = await Promise.all([
			getUser(params.id),
			getPlayerTeams(params.id)
		]);

		return { userDetails, userTeams };
	}
};

export const ssr = false;
