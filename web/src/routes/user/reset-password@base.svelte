<script lang="ts">
	import { page } from '$app/stores';
	import { performPasswordReset } from '$lib/api/auth';
	import logo from '../../images/logo.png';
	import { PASSWORD_CHECK, PASSWORD_PROMPT } from '$lib/config';
	import { formHandler, inputHandler } from '$lib/form-inputs';

	const token = $page.url.searchParams.get('token');

	let isLoading = false;

	const [passwordState, passwordHandlers] = inputHandler<string>({
		errorText: PASSWORD_PROMPT,
		validator: (newValue) => PASSWORD_CHECK(newValue)
	});

	const [confirmPasswordState, confirmPasswordHandlers] = inputHandler<string>({
		errorText: 'Make sure that you have typed in the same password in both fields',
		validator: (newValue) => newValue === passwordState.get().value
	});

	const form = formHandler([passwordHandlers, confirmPasswordHandlers]);

	function doPasswordResest() {
		if (form.validateAll()) {
			isLoading = true;
			performPasswordReset({ token, password: passwordState.get().value }).finally(
				() => (isLoading = false)
			);
		}
	}
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

		<button type="submit" class="btn primary mt-5" class:isLoading disabled={isLoading}>
			Reset password
		</button>
	</form>
</div>
