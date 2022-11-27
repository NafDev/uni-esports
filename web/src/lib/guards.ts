import { redirect, type Cookies } from '@sveltejs/kit';
import type { Role } from '@uni-esports/interfaces';

export class PageGuard {
	private hasSessionCookies = false;
	private negator = false;

	private tokenPayload?: {
		sessionHandle: string;
		uid: string;
		up: { roles: string[]; pendingEmailVerification?: true };
	};

	constructor(cookies: Cookies) {
		const sessionCookies = cookies.get('sFrontToken');

		if (sessionCookies) {
			this.hasSessionCookies = true;

			const b64data = decodeURIComponent(cookies.get('sFrontToken'));
			this.tokenPayload = JSON.parse(Buffer.from(b64data, 'base64').toString());
		}
	}

	signedIn(redirectAfterAuthentication?: string) {
		const sessionRequired = !this.negator;

		if (!sessionRequired && this.hasSessionCookies) {
			throw redirect(302, '/');
		}

		if (sessionRequired && !this.hasSessionCookies) {
			let redirection = '/users/signin';
			if (redirectAfterAuthentication) {
				redirection += `?redirect=${redirectAfterAuthentication}`;
			}

			throw redirect(302, redirection);
		}

		return this.eval();
	}

	verified() {
		const isVerified = Boolean(
			this.tokenPayload?.up && !this.tokenPayload.up.pendingEmailVerification
		);
		const verificationRequired = !this.negator;

		if (!verificationRequired && isVerified) {
			throw redirect(302, '/');
		}

		if (verificationRequired && !isVerified) {
			throw redirect(302, '/users/pending-verification');
		}

		return this.eval();
	}

	hasRoles(...roles: Role[]) {
		let isAllowed = false;

		if (this.tokenPayload?.up?.roles && Array.isArray(this.tokenPayload?.up?.roles)) {
			for (const role of roles) {
				if (!this.tokenPayload.up.roles.includes(role)) {
					break;
				}
			}
			isAllowed = true;
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
