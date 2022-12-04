<script lang="ts">
	import PageTitle from '$/components/base/pageTitle.svelte';
	import { browser } from '$app/environment';

	import { goto } from '$app/navigation';
	import { getAllUsers } from '$lib/api/admin/users';
	import { createTable } from '$lib/data-table';
	import { inputHandler } from '$lib/form-inputs';
	import { ChevronRight } from '@steeze-ui/heroicons';
	import { Icon } from '@steeze-ui/svelte-icon';
	import type { IUserFilters, IUsers } from '@uni-esports/interfaces';
	import { atom } from 'nanostores';

	const [usernameQuery] = inputHandler<string>()
	const [emailQuery] = inputHandler<string>()
	const filters = atom<IUserFilters>()

	const tableData = atom<IUsers[]>([]);
	const pageSize = 20;

	const table = createTable(
		tableData,
		[
			{
				accessor: 'id',
				heading: 'ID'
			},
			{
				accessor: 'username',
				heading: 'Username'
			},
			{
				accessor: 'email',
				heading: 'Email'
			}
		],
		pageSize
	);

	const { headings, cellRows, pagination } = table;
	const { dataLength, pageIndex, pageCount, nextPageAvailable, prevPageAvailable } = pagination;

	if (browser) {
		pageIndex.subscribe(async (value) => {
			const [totalEntries, pageData] = await getAllUsers(value + 1, filters.get());

			tableData.set(pageData);
			dataLength.set(totalEntries);
		});
	}

	function nextPage() {
		pageIndex.set(pageIndex.get() + 1);
	}

	function prevPage() {
		pageIndex.set(pageIndex.get() - 1);
	}

	function updateFitlers() {
		filters.set({email: emailQuery.get().value, username: usernameQuery.get().value})
		pageIndex.set(0);
	}
</script>

<PageTitle>User Management</PageTitle>

<form class="flex flex-row gap-5 mb-5 items-center" id="filters" on:submit|preventDefault={() => updateFitlers()}>
	<input type="text" class="form" placeholder="Username query" bind:value={$usernameQuery.value} />
	<input type="text" class="form" placeholder="Email query" bind:value={$emailQuery.value} />
	<button class="btn primary">Search</button>
</form>

<table class="w-full table-auto text-left">
	<thead>
		<tr>
			{#each headings as heading}
				<th class="p-2">{heading}</th>
			{/each}
		</tr>
	</thead>
	<tbody>
		{#each $cellRows as row}
			<tr
				class="cursor-pointer hover:bg-black/10"
				on:click={() => goto(`/admin/users/${row.get('id')}`)}
			>
				<td class="p-2 w-2/5">{row.get('id')}</td>
				<td class="p-2 w-1/5">{row.get('username')}</td>
				<td class="p-2 w-2/5">{row.get('email')}</td>
				<td><Icon src={ChevronRight} size="18" /></td>
			</tr>
		{/each}
	</tbody>
</table>

<div class="mt-5 flex flex-col items-center justify-center gap-4">
	<span class="text-sm">
		Page <span class="font-semibold">{$pageIndex + 1}</span> of
		<span class="font-semibold">{$pageCount}</span>
	</span>
	<div class="inline-flex">
		<button
			class="rounded-l-md border bg-white/5 px-4 py-2 text-sm font-medium hover:bg-white/20 disabled:hover:bg-white/5"
			on:click={() => prevPage()}
			disabled={!$prevPageAvailable}
		>
			Prev
		</button>
		<button
			class="rounded-r-md border border-l-0 bg-white/5 px-4 py-2 text-sm font-medium hover:bg-white/20 disabled:hover:bg-white/5"
			on:click={() => nextPage()}
			disabled={!$nextPageAvailable}
		>
			Next
		</button>
	</div>
</div>
