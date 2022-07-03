<script lang="ts">
	import { goto } from '$app/navigation';
	import { login } from '$lib/api/auth';
	import logo from '../../images/logo.png';

	let email: string;
	let password: string;

	let isLoading = false;

	function doLogin() {
		console.log("brr")
		isLoading = true
		login({ email, password }, '/').finally(() => isLoading = false);
	}
</script>

<div class="my-auto mx-auto w-5/6 md:w-96">
	<div class="mb-10 flex flex-col items-center justify-center">
		<a href="/">
			<img src={logo} href="/" alt="logo" class="mb-10 h-12" />
		</a>
		<h3 class="text-4xl">Sign In</h3>
	</div>

	<form on:submit|preventDefault={() => doLogin()} class="w-full">
		<label for="email">Email address</label>
		<input class="mb-3 mt-1" type="email" id="email" required bind:value={email} />

		<label for="password">Password</label>
		<input class="mb-3 mt-1" type="password" id="password" required bind:value={password} />
		<button type="button" class="btn" on:click={() => goto('/user/forgot-password')}>
			Forgot password?
		</button>

		<div class="my-5 flex flex-wrap justify-between">
			<button
				type="button"
				on:click={() => goto('/user/signup', { replaceState: true })}
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
