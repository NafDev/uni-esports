<script lang="ts">
	import PageTitle from '$/components/base/pageTitle.svelte';
	import { browser } from '$app/environment';

	import Pagination from '$/components/base/pagination.svelte';
	import { goto } from '$app/navigation';
	import { DEFAULT_PAGE_LEN } from '$lib/config';
	import { createTable } from '$lib/data-table';
	import { inputHandler } from '$lib/form-inputs';
	import { ChevronRight } from '@steeze-ui/heroicons';
	import { Icon } from '@steeze-ui/svelte-icon';
	import type { IMatchListItem } from '@uni-esports/interfaces/';
	import { atom } from 'nanostores';
	import { getMatchesList } from '$lib/api/admin/matches';
	import { gameStore } from '$lib/stores/games';

	let tableData = atom<IMatchListItem[]>([]);

	const [idQuery] = inputHandler<string>();
	const [gameQuery] = inputHandler<string>();
	const [matchStatusQuery] = inputHandler<string>();
	const [timeLowerLimit] = inputHandler<Date>();
	const [timeUpperLimit] = inputHandler<Date>();

	const table = createTable(
		tableData,
		[
			{
				accessor: 'id',
				heading: 'ID'
			},
			{
				accessor: 'gameId',
				heading: 'Game'
			},
			{
				accessor: 'status',
				heading: 'Status'
			},
			{
				accessor: 'startTime',
				heading: 'Start Time'
			}
		],
		DEFAULT_PAGE_LEN
	);

	const { headings, cellRows, pagination } = table;
	const { dataLength, pageIndex, nextPageAvailable, prevPageAvailable, pageCount } = pagination;

	if (browser) {
		pageIndex.subscribe(async (value) => {
			const idFilter = idQuery.get().value;
			const gameFilter = gameQuery.get().value;
			const statusFilter = matchStatusQuery.get().value;
			const timeLower = timeLowerLimit.get().value;
			const timeUpper = timeUpperLimit.get().value;

			const [count, data] = await getMatchesList(value + 1, {
				id: idFilter,
				gameId: gameFilter,
				status: statusFilter,
				startTimeLowerLimit: timeLower && (new Date(timeLower).toISOString() as unknown as Date),
				startTimeUpperLimit: timeUpper && (new Date(timeUpper).toISOString() as unknown as Date)
			});

			tableData.set(data);
			dataLength.set(count);
		});
	}

	function gameNameFromId(id: unknown) {
		if (typeof id !== 'string') return '';
		return $gameStore.get(id).displayName;
	}

	async function updateFilters() {
		pageIndex.set(0);
	}
</script>

<PageTitle title="Match Management" />

<div class="flex flex-row justify-end">
	<button class="btn primary" on:click={() => goto('/admin/matches/create')}
		>Create new match</button
	>
</div>

<form class="my-5" id="filters" on:submit|preventDefault={() => updateFilters()}>
	<div class="flex w-full flex-wrap items-end justify-around gap-5">
		<div class="flex grow flex-col">
			<label for="matchIdFilter">Match ID Filter</label>
			<input
				id="matchIdFilter"
				type="text"
				class="form"
				placeholder="Match ID filter"
				bind:value={$idQuery.value}
			/>
		</div>

		<div class="flex grow flex-col">
			<label for="gameFilter">Game Filter</label>
			<select class="form" id="gameFilter" placeholder="Game filter" bind:value={$gameQuery.value}>
				<option value="">Game filter</option>
				{#each Array.from($gameStore.values()) as game}
					<option value={game.id}>{game.displayName}</option>
				{/each}
			</select>
		</div>

		<div class="flex grow flex-col">
			<label for="statusFilter">Status Filter</label>
			<select
				class="form"
				id="statusFilter"
				placeholder="Status filter"
				bind:value={$matchStatusQuery.value}
			>
				<option value="">Status filter</option>
				{#each ['Scheduled', 'Setup', 'Ongoing', 'Completed'] as status}
					<option value={status}>{status}</option>
				{/each}
			</select>
		</div>

		<div class="flex grow flex-col">
			<label for="startTimeFrom">Start Time From</label>
			<input
				id="startTimeFrom"
				type="datetime-local"
				class="form"
				placeholder="Start time from"
				bind:value={$timeLowerLimit.value}
			/>
		</div>

		<div class="flex grow flex-col">
			<label for="startTimeTo">Start Time To</label>
			<input
				id="startTimeTo"
				type="datetime-local"
				class="form"
				placeholder="Start time to"
				bind:value={$timeUpperLimit.value}
			/>
		</div>

		<button class="btn primary mb-1 w-fit">Search</button>
	</div>
</form>

<table class="mb-2 w-full table-auto text-left">
	<thead>
		<tr>
			{#each headings as heading}
				<th class="p-2">
					{heading}
				</th>
			{/each}
		</tr>
	</thead>
	<tbody>
		{#each $cellRows as row}
			<tr
				class="cursor-pointer hover:bg-black/10"
				on:click={() => goto(`/admin/matches/${row.get('id')}`)}
			>
				<td class="p-2">{row.get('id')}</td>
				<td class="p-2">{gameNameFromId(row.get('gameId'))}</td>
				<td class="p-2">{row.get('status')}</td>

				<td class="p-2">{new Date(row.get('startTime')).toLocaleString()}</td>
				<td><Icon src={ChevronRight} size="18" /></td>
			</tr>
		{/each}
	</tbody>
</table>

<Pagination
	pageCount={$pageCount}
	pageIndex={$pageIndex}
	nextPageAvailable={$nextPageAvailable}
	prevPageAvailable={$prevPageAvailable}
	on:nextPage={() => pageIndex.set(pageIndex.get() + 1)}
	on:prevPage={() => pageIndex.set(pageIndex.get() - 1)}
/>
