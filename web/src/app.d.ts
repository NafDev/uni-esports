/// <reference types="@sveltejs/kit" />

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	declare namespace App {
		// interface Locals {}
		// interface Platform {}
		// interface Stuff {}
	}
}

declare module '*&imagetools' {
	/**
	 * TS/imagetools compatibility workaround
	 * https://github.com/JonasKruckenberg/imagetools/issues/160#issuecomment-1009292026
	 * actual types
	 * - code https://github.com/JonasKruckenberg/imagetools/blob/main/packages/core/src/output-formats.ts
	 * - docs https://github.com/JonasKruckenberg/imagetools/blob/main/docs/guide/getting-started.md#metadata
	 */
	const out: ImgSrc;
	export default out;
}

type ImgSrc = string;
