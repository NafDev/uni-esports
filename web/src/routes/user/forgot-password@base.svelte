<script lang="ts" context="module">
	export const load: Load = (_) => {
		return new PageGuard(_).not.signedIn().done();
	};
</script>

<script lang="ts">
	import { sendPasswordResetEmail } from '$lib/api/auth';
	import { PageGuard } from '$lib/guards';
	import type { Load } from '@sveltejs/kit';
	import logo from '../../images/logo.png';

	let email: string;

	let isLoading = false;

	function sendPasswordReset() {
		isLoading = true;
		sendPasswordResetEmail({ email }).finally(() => (isLoading = false));
	}
</script>

<svelte:head>
	<title>Forgot password | UKUE</title>
</svelte:head>

<div class="m-auto w-5/6 md:w-96">
	<div class="mb-10 flex flex-col items-center justify-center">
		<a href="/">
			<img src={logo} href="/" alt="logo" class="mb-10 h-12" />
		</a>
		<h3 class="text-4xl">Forgot password</h3>
	</div>

	<form on:submit|preventDefault={() => sendPasswordReset()} class="w-full">
		<p class="pb-5">
			To reset your password, enter your email address. We will send you a link for you to reset
			your password.
		</p>

		<label for="email">Enter your email address</label>
		<input class="form mb-5 mt-1" type="email" id="email" required bind:value={email} />

		<button type="submit" class="btn primary" class:isLoading disabled={isLoading}>
			Request password reset
		</button>
	</form>
</div>
