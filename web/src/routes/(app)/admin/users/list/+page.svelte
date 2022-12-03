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
			const [totalEntries, pageData] = await getAllUsers(value + 1);

			tableData.set(pageData)
			dataLength.set(totalEntries)
		})
	}

	function nextPage() {
		pageIndex.set(pageIndex.get() + 1)
	}

	function prevPage() {
		pageIndex.set(pageIndex.get() -1 )
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



<div class="flex flex-col items-center gap-4 justify-center mt-5">
  <span class="text-sm">
      Page <span class="font-semibold">{$pageIndex + 1}</span> of <span class="font-semibold">{$pageCount}</span>
  </span>
  <div class="inline-flex">
      <button class="px-4 py-2 text-sm font-medium bg-white/5 border rounded-l-md hover:bg-white/20 disabled:hover:bg-white/5" on:click={() => prevPage()} disabled={!$prevPageAvailable}>
          Prev
      </button>
      <button class="px-4 py-2 text-sm font-medium bg-white/5 border border-l-0 rounded-r-md hover:bg-white/20 disabled:hover:bg-white/5" on:click={() => nextPage()} disabled={!$nextPageAvailable}>
          Next
      </button>
  </div>
</div>
