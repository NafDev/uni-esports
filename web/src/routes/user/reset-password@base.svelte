<script lang="ts">
	import { page } from '$app/stores';
	import { performPasswordReset } from '$lib/api/auth';
	import logo from '../../images/logo.png';
	import { PASSWORD_CHECK } from '$lib/config';

	const token = $page.url.searchParams.get('token');

	let isLoading = false;

	function doPasswordResest() {
		if (form.password.validate() && form.confirmPassword.validate()) {
			isLoading = true;
			performPasswordReset({ token, password: form.password.value }).finally(
				() => (isLoading = false)
			);
		}
	}

	const form = {
		password: {
			value: '',
			isValid: true,
			errorText:
				'Your password must be at least 6 characters long and include one number, one capital letter, and one special character <a class="font-mono bg-black bg-opacity-30 px-1">#?!@$%^&*-</a>',
			validate: () =>
				(form.password.isValid =
					!form.password.value.length || PASSWORD_CHECK.test(form.password.value))
		},
		confirmPassword: {
			value: '',
			isValid: true,
			errorText: 'Make sure that you have typed in the same password in both fields',
			validate: () =>
				(form.confirmPassword.isValid = form.confirmPassword.value === form.password.value)
		}
	};
</script>

<div class="m-auto w-5/6 md:w-96">
	<div class="mb-10 flex flex-col items-center justify-center">
		<a href="/">
			<img src={logo} href="/" alt="logo" class="mb-10 h-12" />
		</a>
		<h3 class="text-4xl">Reset password</h3>
	</div>

	<form on:submit|preventDefault={() => doPasswordResest()} class="w-full">
		<label class="mt-1" for="password">New Password</label>
		<input
			class="my-2"
			type="password"
			id="password"
			required
			bind:value={form.password.value}
			on:blur={() => form.password.validate()}
		/>
		<p class="mb-2 text-xs text-danger">
			{@html (!form.password.isValid && form.password.errorText) || ''}
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
		<p class="mb-2 text-xs text-danger">
			{(!form.confirmPassword.isValid && form.confirmPassword.errorText) || ''}
		</p>

		<button type="submit" class="btn primary mt-5" class:isLoading disabled={isLoading}>
			Reset password
		</button>
	</form>
</div>
