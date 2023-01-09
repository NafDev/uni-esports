<script lang="ts">
	import HeadTitle from '$/components/base/headTitle.svelte';
	import PageTitle from '$/components/base/pageTitle.svelte';
	import JoinTeamModal from '$/components/teams/joinTeamModal.svelte';
	import NewTeamModal from '$/components/teams/newTeamModal.svelte';
	import '$/css/generic-card.css';
	import { invalidate } from '$app/navigation';
	import { Users } from '@steeze-ui/heroicons';
	import { Icon } from '@steeze-ui/svelte-icon';
	import type { PageData } from './$types';

	export let data: PageData;

	let newTeamModalOpen = false;
	let joinTeamModalOpen = false;

	async function reloadTeamsList() {
		await invalidate('teams:list');
	}
</script>

<HeadTitle value="Teams" />
<PageTitle value="Teams" />

<NewTeamModal bind:open={newTeamModalOpen} on:success={() => reloadTeamsList()} />
<JoinTeamModal bind:open={joinTeamModalOpen} on:success={() => reloadTeamsList()} />

<div class="mb-6 flex flex-row items-center justify-between">
	<p class="text-xl font-bold">Your Teams</p>
	<div class="flex flex-row justify-center gap-4">
		<button class="btn primary-outlined" on:click={() => (joinTeamModalOpen = true)}>
			Join Team
		</button>
		<button class="btn primary" on:click={() => (newTeamModalOpen = true)}>Create Team</button>
	</div>
</div>

{#if data.teams?.length}
	<div class="flex flex-row flex-wrap justify-center">
		{#each data.teams as team (team.id)}
			<a class="max-w-full" href={`/teams/${team.id}`}>
				<div class="card m-3 w-96 max-w-full p-5">
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
