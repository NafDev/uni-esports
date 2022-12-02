import { browser } from '$app/environment';
import { getUniDetails } from '../../../../../lib/api/universities';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
	if (browser) {
		const uniDetails = await getUniDetails(parseInt(params.id, 10));
		return { uniDetails };
	}
};

export const ssr = false;
