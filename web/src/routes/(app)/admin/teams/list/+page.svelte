<script lang="ts">
	import PageTitle from '$/components/base/pageTitle.svelte';
	import { browser } from '$app/environment';

	import Pagination from '$/components/base/pagination.svelte';
	import { goto } from '$app/navigation';
	import { getAllTeams } from '$lib/api/admin/teams';
	import { DEFAULT_PAGE_LEN } from '$lib/config';
	import { createTable } from '$lib/data-table';
	import { inputHandler } from '$lib/form-inputs';
	import { universityStore } from '$lib/stores/universities';
	import { ChevronRight } from '@steeze-ui/heroicons';
	import { Icon } from '@steeze-ui/svelte-icon';
	import type { ITeamListSearchItem } from '@uni-esports/interfaces';
	import { atom } from 'nanostores';

	let tableData = atom<ITeamListSearchItem[]>([]);

	const [nameQuery] = inputHandler<string>();
	let uniIdQuery: string;

	const table = createTable(
		tableData,
		[
			{
				accessor: 'id',
				heading: 'ID'
			},
			{
				accessor: 'name',
				heading: 'Team Name'
			},
			{
				accessor: 'universityId',
				heading: 'University'
			}
		],
		DEFAULT_PAGE_LEN
	);

	const { headings, cellRows, pagination } = table;
	const { dataLength, pageIndex, nextPageAvailable, prevPageAvailable, pageCount } = pagination;

	if (browser) {
		pageIndex.subscribe(async (value) => {
			const nameFilter = nameQuery.get().value;
			const uniFilter = parseInt(uniIdQuery, 10) ?? undefined;

			console.log(typeof uniFilter);

			console.log(uniFilter);
			const [count, data] = await getAllTeams(value + 1, {
				name: nameFilter,
				universityId: uniFilter
			});

			tableData.set(data);
			dataLength.set(count);
		});
	}

	function uniNameFromId(id: unknown) {
		if (typeof id !== 'number') return '';
		return $universityStore.get(id as number).name;
	}

	async function updateFilters() {
		pageIndex.set(0);
	}
</script>

<PageTitle title="Team Management" />

<form class="mb-5" id="filters" on:submit|preventDefault={() => updateFilters()}>
	<div class="flex w-full flex-wrap items-center gap-5">
		<input type="text" class="form" placeholder="Team name query" bind:value={$nameQuery.value} />
		<input
			type="text"
			list="uniFilter"
			class="form"
			placeholder="University"
			bind:value={uniIdQuery}
		/>
		<datalist id="uniFilter">
			{#each Array.from($universityStore.values()) as uni}
				<option value={uni.id}>{uni.name}</option>
			{/each}
		</datalist>
		<button class="btn primary w-fit">Search</button>
	</div>
</form>

<table class="w-full table-auto text-left">
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
				on:click={() => goto(`/admin/teams/${row.get('id')}`)}
			>
				<td class="w-1/5 p-2">{row.get('id')}</td>
				<td class="w-2/5 p-2">{row.get('name')}</td>

				<td class="w-2/5 p-2">{uniNameFromId(row.get('universityId'))}</td>
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
