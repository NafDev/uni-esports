<script lang="ts">
	import ConfirmationModal from '$/components/base/confirmationModal.svelte';
	import PageTitle from '$/components/base/pageTitle.svelte';
	import Crown from '$/icons/Crown.svelte';
	import { getTeamById, invitePlayerBySearch } from '$/lib/api/teams';
	import { addPlayerToTeam } from '$lib/api/admin/teams';
	import { inputHandler } from '$lib/form-inputs';
	import { Deferred } from '$lib/util';
	import { AcademicCap } from '@steeze-ui/heroicons';
	import { Icon } from '@steeze-ui/svelte-icon';
	import type { PageData } from './$types';

	export let data: PageData;
	let { team } = data;

	const [inviteSearch, inviteSearchHelpers] = inputHandler<string>();
	const [userId, userIdHelpers] = inputHandler<string>();
	let userJoinConfirmDialogOpen = false;
	let deferred: Deferred;

	let playerSearchIsLoading = false;
	let playerJoinIsLoading = false;

	async function reloadTeamData() {
		team = await getTeamById({ id: team.id });
	}

	async function doPlayerInvite() {
		if (inviteSearchHelpers.validate(true) && !playerSearchIsLoading) {
			playerSearchIsLoading = true;

			try {
				await invitePlayerBySearch(team.id, { invitedPlayer: $inviteSearch.value });
				reloadTeamData();
			} finally {
				playerSearchIsLoading = false;
			}
		}
	}

	async function doPlayerJoin() {
		if (userIdHelpers.validate(true) && !playerJoinIsLoading) {
			userJoinConfirmDialogOpen = true;
			deferred = new Deferred();
			const confirm = await deferred.promise;

			if (confirm !== 'OK') {
				userJoinConfirmDialogOpen = false;
				return;
			}

			playerJoinIsLoading = true;

			try {
				await addPlayerToTeam(team.id, $userId.value);
				reloadTeamData();
			} finally {
				userJoinConfirmDialogOpen = false;
				playerJoinIsLoading = false;
			}
		}
	}
</script>

<PageTitle title={`${team?.name ?? 'Team Not Found'} ~ Team Management`} hasHeading={false} />

{#if team}
	<div class="my-8 flex flex-row flex-wrap items-end justify-between">
		<p class="text-2xl font-bold">{team.name}</p>
		<div class="flex flex-row items-center">
			<Icon src={AcademicCap} size="24" theme="solid" />
			<p class="ml-3 text-lg font-bold">{team.university}</p>
		</div>
	</div>

	<div class="flex flex-row flex-wrap">
		<div class="flex basis-full flex-col px-4 pb-6 md:basis-1/2">
			<p class="class mb-3 text-xl font-bold">Players</p>
			{#each team.members as member}
				<div
					class="flex flex-row justify-between border-t border-greyText/50 p-5 last-of-type:border-b"
				>
					<p>{member.username}</p>
					{#if member.captain}<Crown />{/if}
				</div>
			{/each}
		</div>

		<div class="basis-full px-4 pb-2 md:basis-1/2">
			<p class="text-bold mb-3 text-xl font-bold">Invite players</p>
			<label for="invitePlayer">Invite player by search</label>
			<div class="mb-2 flex flex-row items-center">
				<input
					type="text"
					class="form"
					id="invitePlayer"
					placeholder="Email or username"
					bind:value={$inviteSearch.value}
				/>
				<button
					class="btn primary ml-4"
					class:isLoading={playerSearchIsLoading}
					on:click={() => doPlayerInvite()}>Invite</button
				>
			</div>

			<ConfirmationModal
				open={userJoinConfirmDialogOpen}
				body={`Are you sure you want to join user with ID ${$userId.value} to this team?`}
				confirmBtnText={'Add player'}
				confirmBtnType={'primary'}
				on:clickConfirm={() => deferred.resolve('OK')}
				on:clickCancel={() => deferred.resolve('CANCEL')}
				on:dismiss={() => deferred.resolve('DISMISS')}
			/>

			<label for="joinPlayer">Add player by user ID</label>
			<div class="mb-2 flex flex-row items-center">
				<input
					type="text"
					class="form"
					id="joinPlayer"
					placeholder="User ID"
					bind:value={$userId.value}
				/>
				<button
					class="btn primary ml-4"
					class:isLoading={playerJoinIsLoading}
					on:click={() => doPlayerJoin()}>Add</button
				>
			</div>
		</div>
	</div>
{:else}
	<p class="my-20 text-center text-3xl">This team cannot be found</p>
{/if}
