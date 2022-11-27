import { PageGuard } from '$/lib/guards';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ cookies, url }) => {
	new PageGuard(cookies).signedIn(url.pathname);
};
