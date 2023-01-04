<script lang="ts">
	import ConfirmationModal from '$/components/base/confirmationModal.svelte';
	import HeadTitle from '$/components/base/headTitle.svelte';
	import PageTitle from '$/components/base/pageTitle.svelte';
	import { invitePlayerBySearch } from '$/lib/api/teams';
	import { invalidate } from '$app/navigation';
	import {
		addPlayerToTeam,
		reassignPlayerAsCaptain,
		removePlayerFromTeam
	} from '$lib/api/admin/teams';
	import { inputHandler } from '$lib/form-inputs';
	import { Deferred } from '$lib/util';
	import { AcademicCap } from '@steeze-ui/heroicons';
	import { VipCrown } from '@steeze-ui/remix-icons';
	import { Icon } from '@steeze-ui/svelte-icon';
	import type { TeamMemberDto } from '@uni-esports/interfaces';
	import type { PageData } from './$types';

	export let data: PageData;
	$: team = data.team;

	const [inviteSearch, inviteSearchHelpers] = inputHandler<string>();
	const [userId, userIdHelpers] = inputHandler<string>();
	let confirmDialogOpen = false;
	let confirmDialogProps: {
		body: string;
		btnText: string;
		btnType: 'primary' | 'danger' | 'warning';
	} = {
		body: '',
		btnText: '',
		btnType: 'primary'
	};

	let deferred: Deferred;

	let playerSearchIsLoading = false;
	let playerJoinIsLoading = false;

	async function reloadTeamData() {
		return invalidate('data:team');
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
			confirmDialogProps = {
				body: `Are you sure you want to join user with ID ${$userId.value} to this team?`,
				btnText: 'Add player',
				btnType: 'primary'
			};

			confirmDialogOpen = true;
			deferred = new Deferred();
			const confirm = await deferred.promise;

			if (confirm !== 'OK') {
				confirmDialogOpen = false;
				return;
			}

			playerJoinIsLoading = true;

			try {
				await addPlayerToTeam(team.id, $userId.value);
				reloadTeamData();
			} finally {
				confirmDialogOpen = false;
				playerJoinIsLoading = false;
			}
		}
	}

	async function doPlayerRemove(player: TeamMemberDto) {
		confirmDialogProps = {
			body: `Are you sure you want to remove user ${player.username} from this team?`,
			btnText: 'Remove player',
			btnType: 'danger'
		};

		confirmDialogOpen = true;
		deferred = new Deferred();
		const confirm = await deferred.promise;

		if (confirm !== 'OK') {
			confirmDialogOpen = false;
			return;
		}

		try {
			await removePlayerFromTeam(team.id, player.id);
			reloadTeamData();
		} finally {
			confirmDialogOpen = false;
		}
	}

	async function doReassignCaptain(player: TeamMemberDto) {
		confirmDialogProps = {
			body: `Are you sure you want to reassign user ${player.username} as captain of this team?`,
			btnText: 'Reassign captain',
			btnType: 'primary'
		};

		confirmDialogOpen = true;
		deferred = new Deferred();
		const confirm = await deferred.promise;

		if (confirm !== 'OK') {
			confirmDialogOpen = false;
			return;
		}

		try {
			await reassignPlayerAsCaptain(team.id, player.id);
			reloadTeamData();
		} finally {
			confirmDialogOpen = false;
		}
	}
</script>

<HeadTitle value={`${team?.name ?? 'Team Not Found'} ~ Team Management`} />
<PageTitle value={'Team Management'} />

{#if team}
	<ConfirmationModal
		open={confirmDialogOpen}
		body={confirmDialogProps.body}
		confirmBtnText={confirmDialogProps.btnText}
		confirmBtnType={confirmDialogProps.btnType}
		on:clickConfirm={() => deferred.resolve('OK')}
		on:clickCancel={() => deferred.resolve('CANCEL')}
		on:dismiss={() => deferred.resolve('DISMISS')}
	/>

	<div class="my-8 flex flex-row flex-wrap items-end justify-between">
		<p class="text-2xl font-bold">{team.name}</p>
		<div class="flex flex-row items-center">
			<Icon src={AcademicCap} size="24" theme="solid" />
			<p class="ml-3 text-lg font-bold">{team.university}</p>
		</div>
	</div>

	<div class="flex flex-row flex-wrap">
		<div class="flex basis-full flex-col px-4 pb-6 md:basis-1/2">
			{#key team}
				<p class="class mb-3 text-xl font-bold">Players</p>
				{#each team.members as member}
					<div
						class="border-greyText/50 flex flex-row items-center justify-between border-t p-5 last-of-type:border-b"
					>
						<p>{member.username}</p>
						<div class="flex flex-row gap-2">
							{#if member.captain}
								<div class="flex h-8 items-center">
									<Icon class="fill-gold" src={VipCrown} theme="solid" size="20" />
								</div>
							{:else}
								<button class="btn primary" on:click={() => doReassignCaptain(member)}
									>Make Captain</button
								>
								<button class="btn danger" on:click={() => doPlayerRemove(member)}>Remove</button>
							{/if}
						</div>
					</div>
				{/each}
			{/key}
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
