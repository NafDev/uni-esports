import { steamAuthLink } from '$/lib/api/auth';
import { browser } from '$app/environment';
import type { SteamOpenIdParameters } from '@uni-esports/interfaces';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ url }) => {
	if (browser) {
		const headers = Object.fromEntries(url.searchParams.entries());

		await steamAuthLink(headers as unknown as SteamOpenIdParameters);
	}
};
