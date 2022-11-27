<script lang="ts">
	import PageTitle from '$/components/base/pageTitle.svelte';
	import { browser } from '$app/environment';

	import type { IUsers } from '@uni-esports/interfaces';
	import { getAllUsers } from '$lib/api/admin/users';
	import { createTable } from '$lib/data-table';
	import { atom } from 'nanostores';
	import { Icon } from '@steeze-ui/svelte-icon';
	import { ChevronRight } from '@steeze-ui/heroicons';
	import { goto } from '$app/navigation';

	const tableData = atom<IUsers[]>([]);

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
		20
	);

	const { headings, cellRows, pagination } = table;
	const { pageIndex, pageCount } = pagination;

	if (browser) {
		pageIndex.subscribe((page) => {
			getAllUsers(page + 1).then((newData) => {
				pageCount.set(newData[0]);
				tableData.set([...tableData.get(), ...newData[1]]);
			});
		});
	}
</script>

<PageTitle>User Management</PageTitle>

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
				on:click={() => goto(`/admin/users/${row.get('id')}`)}
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
