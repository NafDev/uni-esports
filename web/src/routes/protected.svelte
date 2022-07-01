<script lang="ts" context="module">
	import type { Load, LoadEvent, LoadOutput } from '@sveltejs/kit';

	export async function load(): Promise<LoadOutput> {
		return {
			status: 404
		};
	}
</script>

<h1>Brrrrrr</h1>
