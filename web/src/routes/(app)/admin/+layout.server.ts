import { PageGuard } from '$lib/guards';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = ({ cookies, url }) => {
	new PageGuard(cookies).hasRoles('ADMIN').signedIn(url.pathname);
};
