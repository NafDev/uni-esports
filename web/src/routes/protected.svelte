<script lang="ts" context="module">
	import type { LoadEvent } from '@sveltejs/kit';
	import { adminGuard } from '$lib/guards';

	export async function load(_: LoadEvent) {
		return await adminGuard(_);
	}
</script>

<h1>Brrrrrr</h1>
