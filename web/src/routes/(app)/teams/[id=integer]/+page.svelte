<script lang="ts">
	import ConfirmationModal from '$/components/base/confirmationModal.svelte';
	import HeadTitle from '$/components/base/headTitle.svelte';
	import PageTitle from '$/components/base/pageTitle.svelte';
	import MatchResultList from '$/components/card/matchResultList.svelte';
	import '$/css/generic-card.css';
	import {
		getTeamInviteCode,
		invitePlayerBySearch,
		regenerateTeamInviteCode,
		removePlayer
	} from '$/lib/api/teams';
	import { goto } from '$app/navigation';
	import { Deferred } from '$lib/util';
	import { AcademicCap } from '@steeze-ui/heroicons';
	import { VipCrown } from '@steeze-ui/remix-icons';
	import { Icon } from '@steeze-ui/svelte-icon';
	import type { TeamMemberDto } from '@uni-esports/interfaces';
	import type { PageData } from './$types';

	let deferred: Deferred;

	export let data: PageData;
	let { team, isCaptain, teamResults, isTeamMember, userStore } = data;

	let confirmModalProps = {};

	let playerSearch = '';
	let playerSearchIsLoading = false;

	let inviteCode = '';
	let showInviteCode = false;

	let showLeaveModal = false;

	async function doPlayerInvite() {
		if (team && playerSearch !== '' && !playerSearchIsLoading) {
			playerSearchIsLoading = true;

			try {
				await invitePlayerBySearch(team.id, { invitedPlayer: playerSearch });
			} finally {
				playerSearchIsLoading = false;
			}
		}
	}

	async function toggleInviteCode() {
		if (inviteCode === '') {
			const code = await getTeamInviteCode(data.team.id);

			if (code) {
				inviteCode = code.inviteCode;
			}
		}

		showInviteCode = !showInviteCode;
	}

	async function getNewInviteCode() {
		const code = await regenerateTeamInviteCode(data.team.id);

		showInviteCode = false;

		if (code) {
			inviteCode = code.inviteCode;
		}
	}

	async function doLeaveTeam() {
		confirmModalProps = {
			body: 'Are you sure you want to leave this team?',
			confirmBtnText: 'Leave team',
			confirmBtnType: 'danger',
			title: 'Leave team'
		};

		showLeaveModal = true;
		deferred = new Deferred();
		const confirm = await deferred.promise;

		if (confirm !== 'OK') {
			showLeaveModal = false;
			return;
		}

		try {
			await removePlayer(data.team.id, userStore.id);

			goto('/teams');
		} finally {
			showLeaveModal = false;
		}
	}

	async function doPlayerKick(player: TeamMemberDto) {
		confirmModalProps = {
			body: `Are you sure you want to kick <strong>${player.username}</string>?`,
			confirmBtnText: 'Kick',
			confirmBtnType: 'danger',
			title: 'Kick player'
		};

		showLeaveModal = true;
		deferred = new Deferred();
		const confirm = await deferred.promise;

		if (confirm !== 'OK') {
			showLeaveModal = false;
			return;
		}

		try {
			await removePlayer(data.team.id, player.id);

			team = { ...team, members: team.members.filter((member) => member.id !== player.id) };
		} finally {
			showLeaveModal = false;
		}
	}
</script>

<HeadTitle value={`Team - ${team.name}`} />
<PageTitle value="Team Page" />

<ConfirmationModal
	on:clickConfirm={() => deferred.resolve('OK')}
	on:clickCancel={() => deferred.resolve('CANCEL')}
	on:dismiss={() => deferred.resolve('DISMISS')}
	open={showLeaveModal}
	{...confirmModalProps}
/>

<div class="my-8 flex flex-row flex-wrap items-end justify-between">
	<p class="text-xl font-bold">{team.name}</p>
	<div class="flex flex-row items-center">
		<Icon src={AcademicCap} size="24" theme="solid" />
		<p class="ml-3 text-lg font-bold">{team.university}</p>
	</div>
</div>

<div class="flex flex-row flex-wrap">
	<div class="my-6 flex w-full flex-col px-4 md:w-1/2">
		<p class="class mb-3 text-lg font-bold">Players</p>
		{#each team.members as member}
			<div class="card relative mb-3 flex flex-row items-center justify-between p-5 py-5 px-8">
				<p class="font-bold">{member.username}</p>
				{#if isCaptain && member.id !== userStore.id}
					<button class="btn warning absolute right-8" on:click={() => doPlayerKick(member)}
						>Kick</button
					>
				{/if}
				{#if member.id === userStore.id && !isCaptain}
					<button class="btn danger-outlined absolute right-8" on:click={() => doLeaveTeam()}
						>Leave Team</button
					>
				{/if}
				{#if member.captain}
					<Icon class="fill-gold" src={VipCrown} theme="solid" size="20" />
				{/if}
			</div>
		{/each}
	</div>

	<div class="my-6 flex w-full flex-col px-4 md:w-1/2">
		<p class="class mb-3 text-lg font-bold">Recent Matches</p>
		{#if teamResults[0] > 0}
			<MatchResultList matchResults={teamResults[1]} />
		{:else}
			<p class="text-grey-700">This team hasn't played any matches yet.</p>
		{/if}
	</div>

	{#if isCaptain === true}
		<div class="my-6 w-full grow px-4 md:w-1/2">
			<p class="text-bold mb-3 text-lg font-bold">Invite players</p>
			<label for="invitePlayer">Invite player by search</label>
			<div class="mb-2 flex flex-row items-center">
				<input
					type="text"
					class="form"
					id="invitePlayer"
					placeholder="Email or username"
					bind:value={playerSearch}
				/>
				<button
					class="btn primary ml-4"
					class:isLoading={playerSearchIsLoading}
					on:click={() => doPlayerInvite()}>Invite</button
				>
			</div>

			<label for="inviteCode">Invite code</label>
			<div class="mb-2 flex flex-row items-center">
				<input
					type="text"
					class="form"
					id="inviteCode"
					disabled
					placeholder="••••••••••"
					value={showInviteCode ? inviteCode : ''}
				/>
				<div class="ml-4 flex flex-row flex-wrap justify-center gap-4">
					<button
						class="btn primary"
						class:isLoading={playerSearchIsLoading}
						on:click={() => toggleInviteCode()}>{showInviteCode ? 'Hide' : 'Show'} Code</button
					>
					<button
						class="btn warning"
						class:isLoading={playerSearchIsLoading}
						on:click={() => getNewInviteCode()}>Regenerate Code</button
					>
				</div>
			</div>
		</div>
	{/if}
</div>
