import { browser } from '$app/environment';
import { getGamesList } from '$lib/api/matches';
import { gameStore } from '$lib/stores/games';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch }) => {
	if (browser) {
		return { games: gameStore };
	}

	return {
		games: await getGamesList(fetch)
	};
};
