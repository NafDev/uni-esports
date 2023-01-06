import { getUserTeams } from '$lib/api/users';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ depends, fetch }) => {
	depends('teams:list');

	const teams = await getUserTeams(fetch);

	return { teams };
};
