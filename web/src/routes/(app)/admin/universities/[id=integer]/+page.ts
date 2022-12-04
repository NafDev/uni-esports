import { browser } from '$app/environment';
import { goto } from '$app/navigation';
import { getUniDetails } from '../../../../../lib/api/universities';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
	if (browser) {
		const uniDetails = await getUniDetails(parseInt(params.id, 10));

		if (!uniDetails) {
			goto('/admin/universities/list');
		}

		return { uniDetails };
	}
};

export const ssr = false;
