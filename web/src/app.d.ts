/// <reference types="@sveltejs/kit" />

type Boolish = boolean | Promise<boolean> | (() => boolean) | (() => Promise<boolean>);

// See https://kit.svelte.dev/docs/types#the-app-namespace
// for information about these interfaces
declare namespace App {
	// interface Locals {}
	// interface Platform {}
	// interface Session {}
	// interface Stuff
}
