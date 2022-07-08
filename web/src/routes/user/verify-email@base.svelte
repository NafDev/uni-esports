<script lang="ts" context="module">
	import { signedInGuard } from '$lib/guards';
	import type { LoadEvent } from '@sveltejs/kit';

	export async function load(input: LoadEvent) {
		return await signedInGuard(input);
	}
</script>

<div class="h-screen w-screen bg-danger" />
<div class="m-auto w-5/6 md:w-96">hello</div>
