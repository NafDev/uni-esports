import { browser } from '$app/environment';
import type { PageLoad } from './$types';
import SuperTokens from 'supertokens-website';
import { redirect } from '@sveltejs/kit';
import { goto } from '$app/navigation';

export const load: PageLoad = async ({ url, parent }) => {
	if (browser) {
		await parent();
		const redirectParam = url.searchParams.get('redirect');
		const hrefRedirect = decodeURIComponent(redirectParam);

		try {
			const isRefreshed = await SuperTokens.attemptRefreshingSession();

			if (isRefreshed) {
				throw redirect(302, hrefRedirect);
			}
		} catch (error) {
			console.warn(error);
		}

		goto('/users/signin');
	}
};
