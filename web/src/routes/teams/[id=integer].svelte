<script lang="ts">
	import { page } from '$app/stores';
	import PageLoader from '$components/base/pageLoader.svelte';
	import PageTitle from '$components/base/pageTitle.svelte';
	import { getTeamById, invitePlayerBySearch } from '$lib/api/teams';
	import { user } from '$lib/stores/auth.store';
	import { AcademicCap } from '@steeze-ui/heroicons';
	import { Icon } from '@steeze-ui/svelte-icon';
	import type { TeamDto } from '@uni-esports/interfaces';
	import { onMount } from 'svelte';
	import Crown from '../../icons/Crown.svelte';

	let teamIsLoading = true;
	let team: TeamDto;
	let isCaptain = false;
	let isTeamMember = false;

	let playerSearch = '';
	let playerSearchIsLoading = false;

	onMount(async () => {
		try {
			const teamData = await getTeamById({ id: $page.params.id as unknown as number });

			isCaptain = user.get().id === teamData.members.find((a) => a.captain).id;
			isTeamMember = Boolean(teamData.members.find((a) => a.id === user.get().id));

			teamData.members = teamData.members.sort((a) => (a.captain ? 0 : 1));
			team = teamData;
		} catch (error) {
		} finally {
			teamIsLoading = false;
		}
	});

	async function doPlayerInvite() {
		if (team && playerSearch !== '' && !playerSearchIsLoading) {
			playerSearchIsLoading = true;
			invitePlayerBySearch(team.id, { invitedPlayer: playerSearch }).finally(
				() => (playerSearchIsLoading = false)
			);
		}
	}
</script>

<PageTitle>Team Details</PageTitle>

{#if teamIsLoading}
	<PageLoader />
{:else if team}
	<div class="my-8 flex flex-row flex-wrap items-end justify-between">
		<p class="text-2xl font-bold">{team.name}</p>
		<div class="flex flex-row items-center">
			<Icon src={AcademicCap} size="24" theme="solid" />
			<p class="ml-3 text-lg font-bold">{team.university}</p>
		</div>
	</div>

	<div class="box flex flex-row flex-wrap">
		<div class="flex flex-col">
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

		{#if isCaptain}
			<div>
				<p class="text-bold mb-3 text-xl font-bold">Invite players</p>
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
			</div>
		{/if}
	</div>
{:else}
	<p class="my-20 text-center text-3xl">This team cannot be found</p>
{/if}

<style>
	.box > div {
		@apply basis-full p-3 md:basis-1/2;
	}
</style>
