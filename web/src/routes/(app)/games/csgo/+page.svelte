<script lang="ts">
	import HeadTitle from '$/components/base/headTitle.svelte';
	import PageTitle from '$/components/base/pageTitle.svelte';
	import { ChevronRight } from '@steeze-ui/heroicons';
	import { Icon } from '@steeze-ui/svelte-icon';
	import { formatDistanceToNowStrict } from 'date-fns';
	import type { PageData } from './$types';
	import '$/css/generic-card.css';

	export let data: PageData;
	const matches = data.matches[1];
</script>

<HeadTitle value="Counter-Strike: Global Offensive" />
<PageTitle value="Counter-Strike: Global Offensive" />

<p class="text-xl font-bold">Recent Matches</p>

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
