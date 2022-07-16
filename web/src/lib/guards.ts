import { browser } from '$app/env';
import type { LoadEvent, LoadOutput } from '@sveltejs/kit';

export const signedInGuard = async ({ url, session }: LoadEvent) => {
	if (!browser && !session.user) {
		return {
			status: 302,
			redirect: `/user/signin?redirect=${url.pathname}`
		};
	}

	return {};
};

export const signedOutGuard = async ({ session }: LoadEvent) => {
	if (!browser && session.user) {
		return {
			status: 302,
			redirect: `/`
		};
	}

	return {};
};

export const adminGuard = async ({ session }: LoadEvent) => {
	if (!browser && (!session.user || !session.user.roles.includes('ADMIN'))) {
		return {
			status: 404
		};
	}
	return {};
};

export async function customGuard(
	load: LoadEvent,
	customGuardFn: (loadEvent: LoadEvent) => LoadOutput
): Promise<LoadOutput> {
	if (!browser) {
		return customGuardFn(load);
	}
	return {};
}
