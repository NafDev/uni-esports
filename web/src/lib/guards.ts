import { browser } from '$app/env';
import type { LoadEvent, LoadOutput } from '@sveltejs/kit';
import type { Role } from '@uni-esports/interfaces';

export class PageGuard {
	isAllowed = true;
	negator = false;

	loadInput: LoadEvent;
	redirect: string | null;

	constructor(input: LoadEvent) {
		this.loadInput = input;
		this.redirect = null;
	}

	signedIn() {
		this.isAllowed = Boolean(this.loadInput.session.user);
		this.redirect = this.negator ? '/' : '/user/signin';
		return this.eval();
	}

	verified() {
		this.isAllowed = Boolean(
			this.loadInput.session.user && !this.loadInput.session.user.pendingEmailVerification
		);
		return this.eval();
	}

	hasRoles(...roles: Role[]) {
		for (const role of roles) {
			if (!this.loadInput.session.user.roles.includes(role)) {
				this.isAllowed = false;
				return this.eval();
			}
		}

		return this.eval();
	}

	redirection(redirect: string) {
		this.redirect = redirect;
		return this;
	}

	get not() {
		this.negator = true;
		return this;
	}

	async done(): Promise<LoadOutput> {
		if (browser || this.isAllowed) return {};

		if (this.redirect) {
			return {
				status: 302,
				redirect: this.redirect
			};
		}

		return {
			status: 404
		};
	}

	private eval() {
		if (this.negator) {
			this.isAllowed = !this.isAllowed;
			this.negator = !this.negator;
		}
		return this;
	}
}
