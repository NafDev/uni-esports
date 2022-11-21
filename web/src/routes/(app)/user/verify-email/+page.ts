import { verifyEmail } from '$/lib/api/auth';
import { browser } from '$app/environment';
import { goto } from '$app/navigation';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ url }) => {
	if (browser) {
		const token = url.searchParams.get('token');

		if (token) {
			await verifyEmail(token);
		}

		goto('/', { replaceState: true });
	}
};
