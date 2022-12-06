<script lang="ts">
	import PageTitle from '$/components/base/pageTitle.svelte';
	import Crown from '$/icons/Crown.svelte';
	import { invitePlayerBySearch } from '$/lib/api/teams';
	import { AcademicCap } from '@steeze-ui/heroicons';
	import { Icon } from '@steeze-ui/svelte-icon';
	import type { PageData } from './$types';

	export let data: PageData;
	const { team, isCaptain, isTeamMember } = data;

	let playerSearch = '';
	let playerSearchIsLoading = false;

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
</script>

<PageTitle title={`Team - ${team.name}`} hasHeading={false} />

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

		{#if isCaptain}
			<div class="basis-full px-4 pb-2 md:basis-1/2">
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
