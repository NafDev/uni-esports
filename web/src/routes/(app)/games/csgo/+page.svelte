<script lang="ts">
	import Accordion from '$/components/base/accordion.svelte';
	import HeadTitle from '$/components/base/headTitle.svelte';
	import PageTitle from '$/components/base/pageTitle.svelte';
	import AcceptScrimModal from '$/components/scrims/acceptScrimModal.svelte';
	import CreateScrimModal from '$/components/scrims/createScrimModal.svelte';
	import '$/css/generic-card.css';
	import { ChevronRight } from '@steeze-ui/heroicons';
	import { Icon } from '@steeze-ui/svelte-icon';
	import { formatDistanceToNowStrict } from 'date-fns';
	import type { PageData } from './$types';

	export let data: PageData;
	const showScrimButton = Boolean(data.playerTeams !== undefined);
	const captainedTeams = data.playerTeams
		?.filter((team) =>
			team.members.find((player) => player.id === data.userStore.id && player.captain)
		)
		.map((team) => ({ value: team.id, label: team.name }));

	const matches = data.matches[1];

	let createScrimModalOpen = false;
	let acceptScrimModalOpen = false;

	let acceptingScrimId = undefined;

	const formatDate = new Intl.DateTimeFormat('en-GB', {
		day: 'numeric',
		month: 'long',
		year: 'numeric',
		hour: 'numeric',
		minute: 'numeric'
	});

	function doAcceptScrim(scrimId) {
		acceptingScrimId = scrimId;
		acceptScrimModalOpen = true;
	}
</script>

<HeadTitle value="Counter-Strike: Global Offensive" />
<PageTitle value="Counter-Strike: Global Offensive" />

<p class="mb-5 text-xl font-bold">Recent Matches</p>

{#if matches.length === 0}
	<p>There are no recent matches. Time for a scrim?</p>
{/if}

{#each matches as result}
	<a href={`/matches/csgo/${result.id}`}>
		<div class="card my-2 flex w-full flex-row items-center justify-between p-5">
			<div class="flex grow flex-row items-center justify-between gap-2 px-4">
				<p class="text-lg font-bold" class:text-success={result.status === 'Ongoing'}>
					{result.status === 'Ongoing'
						? 'In progress'
						: `${formatDistanceToNowStrict(new Date(result.startTime))} ago`}
				</p>

				<div class="flex  basis-3/5 flex-row flex-wrap items-center gap-6">
					<p class="text-lg">
						{result.teams.at(0).name}
					</p>
					<p class="min-w-fit text-lg font-bold">
						{result.teams.at(0).score} — {result.teams.at(1).score}
					</p>
					<p class="text-lg">
						{result.teams.at(1).name}
					</p>
				</div>
			</div>
			<Icon src={ChevronRight} size="16" />
		</div>
	</a>
{/each}

<div class="mt-10 mb-5 flex flex-row justify-between">
	<p class="text-xl font-bold">Scrim Finder</p>
	<button
		class="btn primary"
		class:invisible={!showScrimButton}
		on:click={() => (createScrimModalOpen = true)}
	>
		Create Scrim Request
	</button>
</div>
{#if data.scrims.length === 0}
	<p class="text-grey-700">There are currently no open scrim requests for this game.</p>
{:else}
	{#each data.scrims as scrim}
		<Accordion class="card mb-2 items-center p-5">
			<div class="flex flex-row items-center gap-10 px-4" slot="heading">
				<p class="basis-2/5 text-grey-700">
					Match starts on <strong class="text-grey-900"
						>{formatDate.format(new Date(scrim.matchStart))}</strong
					>
				</p>

				<p class="basis-2/5 text-grey-700">
					Accept deadline on {formatDate.format(new Date(scrim.acceptDeadline))}
				</p>
				<p class="text-grey-700">
					vs <strong class="pl-1 text-grey-950">{scrim.requestingTeam.name}</strong>
				</p>
			</div>
			<div class="flex w-full flex-row justify-between px-4 pt-5" slot="content">
				<div>
					<p class="font-bold text-grey-950">Requesting Team</p>
					<a href={`/teams/${scrim.requestingTeam.id}`}>
						<p class="underline-offset-2 hover:underline">{scrim.requestingTeam.name}</p>
					</a>
					<p class="text-grey-700">{scrim.requestingTeam.university.name}</p>
				</div>
				<div class="flex flex-col items-center justify-center gap-2">
					<button
						class="btn primary-outlined"
						disabled={Boolean(
							!data.userStore?.id ||
								captainedTeams.find((team) => team.value === scrim.requestingTeam.id)
						)}
						on:click={() => doAcceptScrim(scrim.id)}
					>
						Accept Scrim
					</button>
				</div>
			</div>
		</Accordion>
	{/each}
{/if}

{#if acceptingScrimId}
	<AcceptScrimModal
		bind:open={acceptScrimModalOpen}
		bind:scrimId={acceptingScrimId}
		availableTeams={captainedTeams}
	/>
{/if}

{#if showScrimButton}
	<CreateScrimModal
		bind:open={createScrimModalOpen}
		gameId="csgo"
		availableTeams={captainedTeams}
	/>
{/if}
