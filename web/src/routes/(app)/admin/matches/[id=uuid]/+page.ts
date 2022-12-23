import { browser } from '$app/environment';
import { goto } from '$app/navigation';
import { getMatchInfo } from '$lib/api/matches';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, depends }) => {
	depends('data:match');

	if (browser) {
		try {
			const matchData = await getMatchInfo(params.id);

			if (!matchData) {
				await goto('/admin/matches/list');
			}

			return { matchData };
		} catch (error) {
			return {};
		}
	}
};
