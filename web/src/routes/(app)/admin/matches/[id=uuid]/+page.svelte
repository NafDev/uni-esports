<script lang="ts">
	import HeadTitle from '$/components/base/headTitle.svelte';
	import PageTitle from '$/components/base/pageTitle.svelte';
	import { gameStore } from '$lib/stores/games';
	import { ChevronRight } from '@steeze-ui/heroicons';
	import { Icon } from '@steeze-ui/svelte-icon';
	import type { PageData } from './$types';

	export let data: PageData;
	$: match = data.matchData;
</script>

<HeadTitle value={`${match?.id ?? 'Match Not Found'} ~ Match Management`} />
<PageTitle value={'Match Management'} />

{#if match}
	<p class="mb-7 text-xl font-bold">Match Details</p>
	<div class="flex flex-row flex-wrap">
		<div class="mb-5 mt-1 flex basis-1/2 flex-col px-4">
			<label for="matchId">ID</label>
			<input class="form" id="matchId" disabled value={match.id} />
		</div>

		<div class="mb-5 mt-1 flex basis-1/2 flex-col px-4">
			<label for="game">Game</label>
			<input class="form" id="game" disabled value={$gameStore.get(match.gameId).displayName} />
		</div>

		<div class="mb-5 mt-1 flex basis-1/2 flex-col px-4">
			<label for="status">Match Status</label>
			<input class="form" id="status" disabled value={match.status} />
		</div>

		<div class="mb-5 mt-1 flex basis-1/2 flex-col px-4">
			<label for="startTime">Start Time</label>
			<input
				class="form"
				id="startTime"
				disabled
				value={new Date(match.startTime).toLocaleString()}
			/>
		</div>

		<div class="mb-5 mt-1 flex basis-1/2 flex-col px-4">
			{#each match.teams as team}
				<label for={`team${team.id}`}>Team {team.teamNumber}</label>
				<a href={`/admin/teams/${team.id}`}>
					<div class="mb-2 flex flex-row items-center justify-between p-2 hover:bg-black/10">
						<p>{team.name}</p>
						<Icon src={ChevronRight} size="20" />
					</div>
				</a>
			{/each}
		</div>
	</div>
{:else}
	<p class="my-20 text-center text-3xl">This match cannot be found</p>
{/if}
