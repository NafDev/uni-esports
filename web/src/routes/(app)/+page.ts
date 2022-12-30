import { makeRequest } from '$lib/api/http';
import type { IUpcomingMatch } from '@uni-esports/interfaces';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch }) => {
	const resp = await makeRequest<IUpcomingMatch[]>('GET', '/matches/upcoming?me=true', undefined, {
		fetchWrapper: fetch,
		displayUiError: false
	});

	if (resp) {
		return { upcomingMatches: resp.json };
	}
};
