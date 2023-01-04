<script lang="ts">
	import HeadTitle from '$/components/base/headTitle.svelte';
	import PageTitle from '$/components/base/pageTitle.svelte';
	import steamSignin from '$/images/sits_small.png';
	import { performPasswordChange, steamAuthRedirect } from '$/lib/api/auth';
	import { PASSWORD_CHECK, PASSWORD_PROMPT } from '$/lib/config';
	import { formHandler, inputHandler } from '$/lib/form-inputs';
	import { user, userInfo } from '$lib/stores/auth';

	let oldPassword = '';
	let isLoadingPasswdChange = false;

	const [newPasswordState, newPasswordHandler] = inputHandler({
		errorText: PASSWORD_PROMPT,
		validator: (newValue: string) => PASSWORD_CHECK(newValue)
	});

	const [confirmNewPasswordState, confirmNewPasswordHandler] = inputHandler({
		errorText: 'Make sure that you have typed in the same password in both fields',
		validator: (newValue: string) => newValue === newPasswordState.get().value
	});

	const passwordForm = formHandler([newPasswordHandler, confirmNewPasswordHandler]);

	async function doPasswordChange() {
		if (passwordForm.validateAll()) {
			isLoadingPasswdChange = true;

			const res = await performPasswordChange({
				oldPassword,
				password: newPasswordState.get().value
			}).finally(() => (isLoadingPasswdChange = false));

			if (res) {
				oldPassword = '';
				newPasswordState.set({ isValid: true, value: '' });
				confirmNewPasswordState.set({ isValid: true, value: '' });
			}
		}
	}
</script>

<HeadTitle value="Profile" />
<PageTitle value="Profile" />

<div class="flex flex-row flex-wrap justify-items-stretch">
	<!-- Generic Profile Fields -->
	<div class="flex grow basis-full flex-col p-3 md:basis-1/2">
		<p class="mb-7 text-xl font-bold">Profile Information</p>

		<div class="mb-5 mt-1 flex flex-col">
			<label for="email">Email address</label>
			<div class="flex flex-row items-center gap-2">
				<input class="form" type="email" id="email" value={$userInfo?.email ?? ''} disabled />
				{#if $user.pendingEmailVerification}
					<a href="/users/pending-verification"><button class="btn primary">Verify email</button></a
					>
				{/if}
			</div>
		</div>

		<label for="username">Username</label>
		<div class="mb-5 mt-1 flex flex-row items-center">
			<input class="form" type="text" id="username" value={$userInfo?.username ?? ''} disabled />
		</div>

		<p class="my-5 font-bold">Change password</p>
		<div class="flex flex-row flex-wrap gap-2">
			<div class="flex grow flex-col ">
				<label for="oldPassword">Old password</label>
				<input
					class="form mb-5 mt-1 grow"
					type="password"
					id="oldPassword"
					bind:value={oldPassword}
				/>
			</div>

			<div class="flex grow flex-col ">
				<label for="newPassword">New password</label>
				<input
					class="form mb-5 mt-1 grow"
					type="password"
					id="newPassword"
					bind:value={$newPasswordState.value}
					on:blur={() => newPasswordHandler.validate()}
				/>
			</div>

			<div class="basis-full">
				<label for="confirmPassword">Confirm new password</label>
				<div class="mb-5 mt-1 flex flex-row items-center">
					<input
						class="form"
						type="password"
						id="confirmPassword"
						bind:value={$confirmNewPasswordState.value}
						on:blur={() => confirmNewPasswordHandler.validate()}
					/>
					<button
						class="btn primary ml-4"
						class:isLoading={isLoadingPasswdChange}
						on:click={() => doPasswordChange()}
					>
						Update
					</button>
				</div>
				<p class="mb-2 text-xs text-danger">
					{@html (!$newPasswordState.isValid && newPasswordHandler.errorText) || ''}
				</p>
				<p class="mb-2 text-xs text-danger">
					{(!$confirmNewPasswordState.isValid && confirmNewPasswordHandler.errorText) || ''}
				</p>
			</div>
		</div>
	</div>

	<!-- Linked Game Profiles -->
	<div class="flex grow basis-full flex-col p-3 md:basis-1/2">
		<p class="mb-7 text-xl font-bold">Linked Game Profiles</p>

		<div class="flex flex-col">
			<label for="steam64Id">Steam</label>
			{#if $userInfo?.steam64}
				<div class="mb-5 mt-1 flex items-center">
					<input class="form" type="text" id="steam64Id" value={$userInfo?.steam64} disabled />
					<a
						class="ml-4"
						href={`https://steamcommunity.com/profiles/${$userInfo?.steam64}`}
						target="_blank"
						rel="noreferrer"
					>
						<button class="btn primary-outlined">Profile</button>
					</a>
				</div>
			{:else}
				<button class="my-3" on:click={() => steamAuthRedirect()}>
					<img src={steamSignin} alt="Sign In Through Steam" id="steam64Id" />
				</button>
			{/if}
		</div>
	</div>
</div>
