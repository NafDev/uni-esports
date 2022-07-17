<script lang="ts" context="module">
	export async function load(load: LoadEvent): Promise<LoadOutput> {
		return await signedOutGuard(load);
	}
</script>

<script lang="ts">
	import { goto } from '$app/navigation';
	import { signUp } from '$lib/api/users';
	import { PASSWORD_CHECK, PASSWORD_PROMPT, USERNAME_CHECK, USERNAME_PROMPT } from '$lib/config';
	import { formHandler, inputHandler } from '$lib/form-inputs';
	import { signedOutGuard } from '$lib/guards';
	import type { LoadEvent, LoadOutput } from '@sveltejs/kit';
	import logo from '../../images/logo.png';

	let isLoading = false;

	const [usernameState, usernameHandlers] = inputHandler<string>({
		errorText: USERNAME_PROMPT,
		validator: (newValue) => USERNAME_CHECK.test(newValue)
	});

	const [emailState, emailHandlers] = inputHandler<string>({
		errorText: 'Please enter your university email address (ending with .ac.uk)',
		validator: (newValue) => newValue.endsWith('.ac.uk')
	});

	const [passwordState, passwordHandlers] = inputHandler<string>({
		errorText: PASSWORD_PROMPT,
		validator: (newValue) => PASSWORD_CHECK(newValue)
	});

	const [confirmPasswordState, confirmPasswordHandlers] = inputHandler<string>({
		errorText: 'Make sure that you have typed in the same password in both fields',
		validator: (newValue) => newValue === passwordState.get().value
	});

	const form = formHandler([
		usernameHandlers,
		emailHandlers,
		passwordHandlers,
		confirmPasswordHandlers
	]);

	function doSignUp() {
		if (form.validateAll()) {
			isLoading = true;

			signUp(
				{
					username: usernameState.get().value,
					email: emailState.get().value,
					password: passwordState.get().value
				},
				'/user/signin'
			).finally(() => (isLoading = false));
		}
	}
</script>

<div class="my-auto mx-auto w-5/6 md:w-96">
	<div class="mb-10 flex flex-col items-center justify-center">
		<a href="/">
			<img src={logo} href="/" alt="logo" class="mb-10 h-12" />
		</a>
		<h3 class="text-4xl">Sign Up</h3>
	</div>

	<form
		on:submit|preventDefault|stopPropagation={() => doSignUp()}
		class="center flex w-full flex-col"
	>
		<label class="mt-1" for="username">Username</label>
		<input
			class="form my-2"
			type="text"
			id="username"
			required
			bind:value={$usernameState.value}
			on:blur={() => usernameHandlers.validate()}
		/>
		<p class="mb-2 text-xs text-danger">
			{(!$usernameState.isValid && usernameHandlers.errorText) || ''}
		</p>

		<label class="mt-1" for="email">Email address</label>
		<input
			class="form my-2"
			type="email"
			id="email"
			required
			bind:value={$emailState.value}
			on:blur={() => emailHandlers.validate()}
		/>
		<p class="mb-2 text-xs text-danger">
			{(!$emailState.isValid && emailHandlers.errorText) || ''}
		</p>

		<label class="mt-1" for="password">Password</label>
		<input
			class="form my-2"
			type="password"
			id="password"
			required
			bind:value={$passwordState.value}
			on:blur={() => passwordHandlers.validate()}
		/>
		<p class="mb-2 text-xs text-danger">
			{@html (!$passwordState.isValid && passwordHandlers.errorText) || ''}
		</p>

		<label class="mt-1" for="password">Confirm Password</label>
		<input
			class="form my-2"
			type="password"
			id="password"
			required
			bind:value={$confirmPasswordState.value}
			on:blur={() => confirmPasswordHandlers.validate()}
		/>
		<p class="mb-2 text-xs text-danger">
			{(!$confirmPasswordState.isValid && confirmPasswordHandlers.errorText) || ''}
		</p>

		<div class="mt-3 flex flex-row flex-wrap items-center justify-around">
			<button
				type="button"
				class="btn"
				on:click={() => goto('/user/signin', { replaceState: true })}
			>
				Sign into existing account
			</button>
			<button class="btn primary" class:isLoading disabled={isLoading}>Create account</button>
		</div>
	</form>
</div>
