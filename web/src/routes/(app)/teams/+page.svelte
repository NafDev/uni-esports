<script lang="ts">
	import HeadTitle from '$/components/base/headTitle.svelte';
	import PageTitle from '$/components/base/pageTitle.svelte';
	import NewTeamModal from '$/components/teams/newTeamModal.svelte';
	import { playerTeams } from '$lib/stores/teams';
	import { Users } from '@steeze-ui/heroicons';
	import { Icon } from '@steeze-ui/svelte-icon';

	let newTeamModalOpen = false;
</script>

<HeadTitle value="Teams" />
<PageTitle value="Teams" />

<NewTeamModal bind:open={newTeamModalOpen} />

<div class="flex flex-row items-center justify-between px-10">
	<p class="my-8 font-bold">Your Teams</p>
	<button class="btn primary" on:click={() => (newTeamModalOpen = true)}>Create Team</button>
</div>

{#if $playerTeams?.length}
	<div class="flex flex-row flex-wrap justify-center">
		{#each $playerTeams as team (team.id)}
			<a class="max-w-full" href={`/teams/${team.id}`}>
				<div
					class="m-3 w-96 max-w-full rounded-md bg-secondary/20 p-5 transition-all hover:scale-105 hover:bg-secondary/30 hover:drop-shadow-lg"
				>
					<div class="flex flex-row items-center justify-between">
						<h1 class="text-lg font-bold">{team.name}</h1>
						<div class="flex flex-row items-center">
							<p class="mx-2 font-bold">{team.members.length}</p>
							<Icon src={Users} size="18" theme="solid" />
						</div>
					</div>
				</div>
			</a>
		{/each}
	</div>
{:else}
	<p>You aren't part of any active teams in your university. Ask to join one or create your own!</p>
{/if}
