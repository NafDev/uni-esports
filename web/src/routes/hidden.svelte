<script lang="ts" context="module">
	import { signedInGuard } from '$lib/guards';

	import type { LoadEvent } from '@sveltejs/kit';

	export async function load({ session }: LoadEvent) {
		if (!session.user) {
			return {
				status: 404
			};
		}
		return {};
	}
</script>
