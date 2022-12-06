<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	export let pageIndex: number;
	export let pageCount: number;
	export let prevPageAvailable: boolean;
	export let nextPageAvailable: boolean;

	const dispatch = createEventDispatcher();

	function prevPage() {
		dispatch('prevPage');
	}

	function nextPage() {
		dispatch('nextPage');
	}
</script>

<div class="flex flex-col items-center justify-center gap-4">
	<span class="text-sm">
		Page <span class="font-semibold">{pageIndex + 1}</span> of
		<span class="font-semibold">{pageCount}</span>
	</span>
	<div class="inline-flex">
		<button
			class="rounded-l-md border bg-white/5 px-4 py-2 text-sm font-medium hover:bg-white/20 disabled:hover:bg-white/5"
			on:click={() => prevPage()}
			disabled={!prevPageAvailable}
		>
			Prev
		</button>
		<button
			class="rounded-r-md border border-l-0 bg-white/5 px-4 py-2 text-sm font-medium hover:bg-white/20 disabled:hover:bg-white/5"
			on:click={() => nextPage()}
			disabled={!nextPageAvailable}
		>
			Next
		</button>
	</div>
</div>
