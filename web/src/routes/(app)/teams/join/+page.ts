import { joinTeam } from '$/lib/api/teams';
import type { PageData } from './$types';

export const load: PageData = async ({ url }) => {
	const inviteCode = url.searchParams.get('code');

	if (inviteCode) {
		await joinTeam(inviteCode);
	}

	return {};
};
