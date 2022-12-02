<script lang="ts">
	import type { PageData } from './$types';
	import type { IUserDetails } from '@uni-esports/interfaces';
	import ConfirmationModal from '$/components/base/confirmationModal.svelte';
	import { getUser, unlinkSteamId, updateUserEmail, updateUsername } from '$lib/api/admin/users';
	import { Deferred } from '$lib/util';
	import { inputHandler } from '$lib/form-inputs';
	import { USERNAME_CHECK } from '$lib/config';
	import { universityStore } from '$lib/stores/universities';

	export let data: PageData;

	let userDetails: IUserDetails = data.userDetails;

	let deferredAction: Deferred;
	let modalOpen = false;
	let modalProps: {
		title?: string;
		body?: string;
		confirmBtnText?: string;
		confirmBtnType: 'primary' | 'danger' | 'warning';
	};

	const [email, emailHandler] = inputHandler({
		initialValue: userDetails.email,
		validator: (value) => value.includes('@') && value.trimEnd().endsWith('.ac.uk')
	});
	const [username, usernameHandler] = inputHandler({
		initialValue: userDetails.username,
		validator: (value) => USERNAME_CHECK.test(value)
	});

	async function doActionWithConfirm<T extends (...params: Parameters<T>) => Promise<any>>(
		props: typeof modalProps,
		action: T,
		...params: Parameters<T>
	) {
		deferredAction = new Deferred();

		modalProps = props;
		modalOpen = true;

		try {
			const confirm = await deferredAction.promise;

			if (confirm === 'OK') {
				await action(...params);
				userDetails = await getUser(userDetails.id);
			}
		} finally {
			modalOpen = false;
			modalProps = undefined;
		}
	}

	function doUnlinkSteamId() {
		doActionWithConfirm(
			{
				title: 'Unlink Steam ID',
				body: 'Are you sure you want to unlink the Steam ID from this user? They will be unable to participate in matches which require a Steam account until they link another account.',
				confirmBtnType: 'danger',
				confirmBtnText: 'Unlink'
			},
			unlinkSteamId,
			userDetails.id
		);
	}

	function doUpdateUsername() {
		doActionWithConfirm(
			{
				title: 'Update username',
				body: `Are you sure you want to update this user's username to <b>${
					username.get().value
				}</b>`,
				confirmBtnType: 'primary',
				confirmBtnText: 'Update'
			},
			updateUsername,
			userDetails.id,
			username.get().value
		);
	}

	function doUpdateEmail() {
		doActionWithConfirm(
			{
				title: 'Update email',
				body: `Are you sure you want to update this user's email address to <b>${
					email.get().value
				}</b>? They will need to reverify their email in order to play games.`,
				confirmBtnType: 'primary',
				confirmBtnText: 'Update'
			},
			updateUserEmail,
			userDetails.id,
			email.get().value
		);
	}
</script>

<ConfirmationModal
	bind:open={modalOpen}
	{...modalProps}
	on:clickConfirm={() => deferredAction.resolve('OK')}
	on:clickCancel={() => deferredAction.resolve('CANCEL')}
	on:dismiss={() => deferredAction.resolve('DISMISS')}
/>

<div class="flex flex-row flex-wrap justify-items-stretch">
	<!-- Generic Profile Fields -->
	<div class="flex grow basis-full flex-col p-3 md:basis-1/2">
		<p class="mb-7 text-xl font-bold">Profile Information</p>

		<label for="uid">User ID</label>
		<input class="form mb-5" id="uid" value={userDetails.id} disabled />

		<label for="email">Email address</label>
		<div class="mb-5 flex flex-row flex-wrap items-center justify-end gap-y-2">
			<input
				class="form w-min grow"
				type="email"
				id="email"
				bind:value={$email.value}
				on:input={() => emailHandler.validate()}
			/>
			<p class={`ml-4 ${userDetails.verified ? 'text-success' : 'text-warning'}`}>
				{userDetails.verified ? 'Verified' : 'Not verified'}
			</p>
			<button class="btn primary ml-4" disabled={!$email.isValid} on:click={() => doUpdateEmail()}>
				Update
			</button>
		</div>

		<label for="username">Username</label>
		<div class="mb-5 flex flex-row items-center gap-4">
			<input
				class="form"
				type="text"
				id="username"
				bind:value={$username.value}
				on:input={() => usernameHandler.validate()}
			/>
			<button class="btn primary" disabled={!$username.isValid} on:click={() => doUpdateUsername()}>
				Update
			</button>
		</div>

		<label for="university">University</label>
		<div class="flex flex-row items-center gap-4">
			<input
				class="form"
				type="text"
				id="university"
				value={$universityStore.get(userDetails.universityId).name}
				disabled
			/>
			<a href={`/admin/universities/${userDetails.universityId}`}>
				<button class="btn primary">Manage</button>
			</a>
		</div>

		<p class="my-5 font-bold">User Actions</p>
		<div class="flex flex-row flex-wrap">
			<button class="btn primary">Send password reset</button>
		</div>
	</div>

	<!-- Linked Game Profiles -->
	<div class="flex basis-full flex-col p-3 md:basis-1/2">
		<p class="mb-7 text-xl font-bold">Linked Game Profiles</p>

		<div class="flex flex-col">
			<label for="steam64Id">Steam</label>
			<div class="mb-5 flex items-center">
				<input
					class="form"
					type="text"
					id="steam64Id"
					value={userDetails.steam64Id ?? 'No linked account'}
					disabled
				/>
				{#if userDetails.steam64Id}
					<div class="flex items-stretch">
						<a
							class="ml-4"
							href={userDetails.steam64Id
								? `https://steamcommunity.com/profiles/${userDetails.steam64Id}`
								: ''}
							target="_blank"
							rel="noreferrer"
						>
							<button class="btn primary-outlined">Profile</button>
						</a>
						<button class="btn danger ml-4" on:click={() => doUnlinkSteamId()}>Unlink</button>
					</div>
				{/if}
			</div>
		</div>
	</div>
</div>
