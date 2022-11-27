import { PageGuard } from '$/lib/guards';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ cookies }) => {
	new PageGuard(cookies).signedIn().not.verified();
};
