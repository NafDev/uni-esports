<script lang="ts">
	import { goto } from '$app/navigation';
	import { signUp } from '$lib/api/auth';
	import logo from '../../images/logo.png';

	const usernameCheck = /^[\w-\.]{3,24}$/;
	const passwordCheck = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{6,}$/;

	let isLoading = false;

	const form = {
		username: {
			value: '',
			isValid: true,
			errorText:
				'Your username should be 3-24 characters long and may only include alphanumeric characters, underscores, hypens, and full stops',
			validate: () =>
				(form.username.isValid =
					!form.username.value.length || usernameCheck.test(form.username.value))
		},
		email: {
			value: '',
			isValid: true,
			errorText: 'Please enter your university email address (ending with .ac.uk)',
			validate: () =>
				(form.email.isValid = !form.email.value.length || form.email.value.endsWith('.ac.uk'))
		},
		password: {
			value: '',
			isValid: true,
			errorText:
				'Your password must be at least 6 characters long and include one number, one capital letter, and one special character <a class="font-mono bg-black bg-opacity-30 px-1">#?!@$%^&*-</a>',
			validate: () =>
				(form.password.isValid =
					!form.password.value.length || passwordCheck.test(form.password.value))
		},
		confirmPassword: {
			value: '',
			isValid: true,
			errorText: 'Make sure that you have typed in the same password in both fields',
			validate: () =>
				(form.confirmPassword.isValid = form.confirmPassword.value === form.password.value)
		}
	};

	function doSignUp() {
		if (
			form.username.validate() &&
			form.email.validate() &&
			form.password.validate() &&
			form.confirmPassword.validate()
		) {
			isLoading = true;

			signUp({
				username: form.username.value,
				email: form.email.value,
				password: form.password.value
			}, '/user/signin')
				.finally(() => (isLoading = false));
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
			class="my-2"
			type="text"
			id="username"
			required
			bind:value={form.username.value}
			on:blur={() => form.username.validate()}
		/>
		<p class="mb-2 text-xs text-danger">{!form.username.isValid && form.username.errorText || ''}</p>

		<label class="mt-1" for="email">Email address</label>
		<input
			class="my-2"
			type="email"
			id="email"
			required
			bind:value={form.email.value}
			on:blur={() => form.email.validate()}
		/>
		<p class="mb-2 text-xs text-danger">{!form.email.isValid && form.email.errorText || ''}</p>

		<label class="mt-1" for="password">Password</label>
		<input
			class="my-2"
			type="password"
			id="password"
			required
			bind:value={form.password.value}
			on:blur={() => form.password.validate()}
		/>
		<p class="mb-2 text-xs text-danger">
			{@html !form.password.isValid && form.password.errorText || ''}
		</p>

		<label class="mt-1" for="password">Confirm Password</label>
		<input
			class="my-2"
			type="password"
			id="password"
			required
			bind:value={form.confirmPassword.value}
			on:blur={() => form.confirmPassword.validate()}
		/>
		<p class="mb-2 text-xs text-danger">{!form.confirmPassword.isValid && form.confirmPassword.errorText || ''}</p>

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
