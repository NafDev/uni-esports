<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { signIn } from '$/lib/api/auth';
	import logo from '$/images/logo.png';
	import { onMount } from 'svelte';
	import { pushNotification } from '$lib/stores/notifications';
	import PageTitle from '$/components/base/pageTitle.svelte';

	let redirect: string;

	onMount(() => {
		redirect = $page.url.searchParams.get('redirect');

		if (redirect) {
			pushNotification({
				message: 'Please sign in',
				type: 'warning'
			});
		}
	});

	let email: string;
	let password: string;

	let isLoading = false;

	function doSignIn() {
		isLoading = true;

		signIn({ email, password }, redirect ?? '/').finally(() => (isLoading = false));
	}
</script>

<PageTitle title="Sign in" hasHeading={false} />

<div class="m-auto w-5/6 md:w-96">
	<div class="mb-10 flex flex-col items-center justify-center">
		<a href="/">
			<img src={logo} href="/" alt="logo" class="mb-10 h-12" />
		</a>
		<h3 class="text-4xl">Sign In</h3>
	</div>

	<form on:submit|preventDefault={() => doSignIn()} class="w-full">
		<label for="email">Email address</label>
		<input class="form mb-3 mt-1 w-full" type="email" id="email" required bind:value={email} />

		<label for="password">Password</label>
		<input
			class="form mb-3 mt-1 w-full"
			type="password"
			id="password"
			required
			bind:value={password}
		/>
		<button type="button" class="btn" on:click={() => goto('/users/forgot-password')}>
			Forgot password?
		</button>

		<div class="my-5 flex flex-wrap justify-between">
			<button
				type="button"
				on:click={() => goto('/users/signup', { replaceState: true })}
				class="btn primary-outlined"
			>
				Create an account
			</button>
			<button type="submit" class="btn primary" class:isLoading disabled={isLoading}>
				Sign In
			</button>
		</div>
	</form>
</div>
