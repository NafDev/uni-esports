<script lang="ts">
	import PageTitle from '$/components/base/pageTitle.svelte';
	import { browser } from '$app/environment';

	import { getAllUsers } from '$lib/api/admin/users';
	import { createTable } from '$lib/data-table';
	import { atom } from 'nanostores';
	import { Icon } from '@steeze-ui/svelte-icon';
	import { ChevronRight } from '@steeze-ui/heroicons';
	import { goto } from '$app/navigation';
	import { universityStore } from '$lib/stores/universities';

	let tableData = atom([]);

	const table = createTable(
		tableData,
		[
			{
				accessor: 'id',
				heading: 'ID'
			},
			{
				accessor: 'name',
				heading: 'University Name'
			}
		],
		Infinity
	);

	const { headings, cellRows } = table;

	$: {
		if (browser) {
			tableData.set(Array.from($universityStore.values()));
		}
	}
</script>

<PageTitle>University Management</PageTitle>

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
				on:click={() => goto(`/admin/universities/${row.get('id')}`)}
			>
				{#each Array.from(row.values()) as cell}
					<td class="p-2">
						{cell}
					</td>
				{/each}
				<td>
					<Icon src={ChevronRight} size="18" />
				</td>
			</tr>
		{/each}
	</tbody>
</table>
