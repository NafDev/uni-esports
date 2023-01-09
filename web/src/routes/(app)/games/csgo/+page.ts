import { browser } from '$app/environment';
import { getRecentMatchResults } from '$lib/api/matches';
import { getOpenScrims } from '$lib/api/scrims';
import { getUserTeams } from '$lib/api/users';
import { isSignedIn } from '$lib/stores/auth';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, depends }) => {
	depends('game:data');
	return {
		matches: getRecentMatchResults('csgo', 1, 20, fetch),
		scrims: getOpenScrims(fetch),
		playerTeams: browser && isSignedIn.get() ? getUserTeams(fetch) : undefined
	};
};
