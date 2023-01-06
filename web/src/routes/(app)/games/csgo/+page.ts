import { getRecentMatchResults } from '$lib/api/matches';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch }) => {
	const data = await getRecentMatchResults('csgo', 1, 20, fetch);

	return { matches: data };
};
