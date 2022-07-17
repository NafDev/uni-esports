<script lang="ts" context="module">
	import { signedInGuard } from '$lib/guards';
	import type { LoadEvent } from '@sveltejs/kit';
	import { onMount } from 'svelte';

	export async function load(_: LoadEvent) {
		return await signedInGuard(_);
	}
</script>

<script lang="ts">
	import { PASSWORD_CHECK, PASSWORD_PROMPT } from '$lib/config';
	import steamSignin from '../../images/sits_small.png';
	import { formHandler, inputHandler } from '$lib/form-inputs';
	import { performPasswordChange, steamAuthRedirect } from '$lib/api/auth';
	import { getUserInfo } from '$lib/api/users';
	import { userInfo } from '$lib/stores/auth.store';

	onMount(async () => {
		if (userInfo.get().id === undefined) {
			const info = await getUserInfo();
			userInfo.set(info);
		}
	});

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

<h1 class="mb-5 text-center text-5xl uppercase">Profile</h1>

<div class="flex flex-row flex-wrap justify-items-stretch">
	<!-- Generic Profile Fields -->
	<div class="flex basis-full flex-col p-3 md:basis-1/2">
		<p class="mb-7 text-xl font-bold">Profile Information</p>

		<label for="email">Email address</label>
		<input class="form mb-5 mt-1" type="email" id="email" value={$userInfo.email ?? ''} disabled />

		<label for="username">Username</label>
		<div class="mb-5 mt-1 flex flex-row items-center">
			<input class="form" type="text" id="username" value={$userInfo.username ?? ''} disabled />
		</div>

		<p class="my-5 font-bold">Change password</p>
		<div class="flex flex-row flex-wrap">
			<div class="basis-1/2 pr-2">
				<label for="oldPassword">Old password</label>
				<input class="form mb-5 mt-1" type="password" id="oldPassword" bind:value={oldPassword} />
			</div>

			<div class="basis-1/2 pl-2">
				<label for="newPassword">New password</label>
				<input
					class="form mb-5 mt-1"
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
						on:click={() => doPasswordChange()}>Update</button
					>
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
	<div class="flex basis-full flex-col p-3 md:basis-1/2">
		<p class="mb-7 text-xl font-bold">Linked Game Profiles</p>

		<div class="flex flex-col">
			<label for="steam64Id">Steam</label>
			{#if $userInfo.steam64}
				<div class="mb-5 mt-1 flex items-center">
					<input
						class="form"
						type="text"
						id="steam64Id"
						href={`https://steamcommunity.com/profiles/${$userInfo.steam64}`}
						value={$userInfo.steam64}
						disabled
					/>
					<a
						class="ml-4"
						href={`https://steamcommunity.com/profiles/${$userInfo.steam64}`}
						target="_blank"
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
