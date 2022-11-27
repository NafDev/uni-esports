<script lang="ts">
	import PageTitle from '$/components/base/pageTitle.svelte';
	import { Icon } from '@steeze-ui/svelte-icon';
	import { Users } from '@steeze-ui/heroicons';
	import { playerTeams } from '$lib/stores/teams';
	import NewTeamModal from '$/components/teams/newTeamModal.svelte';

	let newTeamModalOpen = false;
</script>

<svelte:head>
	<title>Teams | UKUE</title>
</svelte:head>

<PageTitle>Teams</PageTitle>

<NewTeamModal bind:open={newTeamModalOpen} />

<div class="flex flex-row items-center justify-between px-10">
	<p class="my-8 text-2xl">Your Teams</p>
	<button class="btn primary" on:click={() => (newTeamModalOpen = true)}>Create Team</button>
</div>

{#if $playerTeams?.length}
	<div class="flex flex-row flex-wrap justify-center">
		{#each $playerTeams as team (team.id)}
			<a href={`/teams/${team.id}`}>
				<div
					class="m-3 w-96 min-w-fit rounded-md bg-secondary/20 p-5 outline outline-1 outline-greyText/50 hover:outline-primary"
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
