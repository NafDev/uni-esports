/// <reference types="@sveltejs/kit" />

import type { AccessTokenPayload } from '@uni-esports/interfaces';

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	declare namespace App {
		interface Locals {
			userid: string;
		}

		// interface Platform {}

		interface Session {
			user?: AccessTokenPayload;
		}

		// interface Stuff {}
	}
}
