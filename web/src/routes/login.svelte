<script context="module" lang="ts">
	import { goto } from '$app/navigation';
	/// import { isLoggedOutGuard } from '@/lib/guards/auth';
	import { userLogin } from '$lib/api/user';

	// export async function load() {
	//   return isLoggedOutGuard();
	// }
</script>

<svelte:head>
	<title>Login</title>
</svelte:head>

<button
	on:click={() =>
		userLogin({ email: 'user@email.com', password: 'password' }).then(() => goto('/'))}
	>Login With Credentials</button
>
