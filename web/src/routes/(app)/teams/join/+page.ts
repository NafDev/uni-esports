import { joinTeam } from '$/lib/api/teams';
import { browser } from '$app/environment';
import { goto } from '$app/navigation';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ url }) => {
	if (browser) {
		const inviteCode = url.searchParams.get('code');

		if (inviteCode) {
			await joinTeam(inviteCode);
		}

		goto('/teams');
	}
};
