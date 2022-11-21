import type { RequestEvent } from '.svelte-kit/types/src/routes/teams/$types';
import { redirect, type Cookies } from '@sveltejs/kit';
import type { Role } from '@uni-esports/interfaces';
import { BASE_API_URL } from './config';

export class PageGuard {
	private sessionResp: Promise<Response | void> | undefined;

	private negator = false;

	private tokenPayload:
		| {
				sessionHandle: string;
				userId: string;
				userData: { roles: string[]; pendingEmailVerification?: true };
		  }
		| undefined;

	constructor(cookies: Cookies, fetch: RequestEvent['fetch']) {
		const sessionCookies = cookies.get('sAccessToken');

		if (sessionCookies) {
			this.sessionResp = fetch(BASE_API_URL + '/session', { credentials: 'include' });

			const b64data = decodeURIComponent(cookies.get('sAccessToken')).split('.').at(1);
			this.tokenPayload = JSON.parse(Buffer.from(b64data, 'base64').toString());
		}
	}

	async signedIn() {
		const resp = await this.sessionResp;

		const sessionValid = resp && resp.status === 200;
		const sessionRequired = !this.negator;

		if (!sessionRequired && sessionValid) {
			throw redirect(302, '/');
		}

		if (sessionRequired && !sessionValid) {
			throw redirect(302, 'user/signin');
		}

		return this.eval();
	}

	verified() {
		const isVerified = Boolean(
			this.tokenPayload && !this.tokenPayload.userData.pendingEmailVerification
		);
		const verificationRequired = !this.negator;

		if (!verificationRequired && isVerified) {
			throw redirect(302, '/');
		}

		if (verificationRequired && !isVerified) {
			throw redirect(302, '/user/pending-verification');
		}

		return this.eval();
	}

	hasRoles(...roles: Role[]) {
		let isAllowed = true;
		if (Array.isArray(this.tokenPayload.userData.roles)) {
			for (const role of roles) {
				if (!this.tokenPayload.userData.roles.includes(role)) {
					isAllowed = false;
					break;
				}
			}
		}

		if (!isAllowed) {
			throw redirect(302, '/404');
		}
		return this.eval();
	}

	get not() {
		this.negator = true;
		return this;
	}

	private eval() {
		if (this.negator) {
			this.negator = !this.negator;
		}
		return this;
	}
}
