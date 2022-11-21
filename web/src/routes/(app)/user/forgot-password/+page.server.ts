import { PageGuard } from '$/lib/guards';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ cookies, fetch }) => {
	await new PageGuard(cookies, fetch).not.signedIn();
};
