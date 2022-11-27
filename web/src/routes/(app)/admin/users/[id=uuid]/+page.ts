import { browser } from '$app/environment';
import { getUser } from '$lib/api/admin/users';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
	if (browser) {
		const userDetails = await getUser(params.id);
		return { userDetails };
	}
};

export const ssr = false;
