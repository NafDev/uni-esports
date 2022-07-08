import type { LoadEvent } from '@sveltejs/kit';

export const signedInGuard = async ({ url, session }: LoadEvent) => {
	if (!session.user) {
		return {
			status: 302,
			redirect: `/user/signin?redirect=${url.pathname}`
		};
	}

	return {};
};

export const adminGuard = async ({ session }: LoadEvent) => {
	if (!session.user || !session.user.roles.includes('ADMIN')) {
		return {
			status: 404
		};
	}
	return {};
};
