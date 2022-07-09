<script lang="ts">
	import { goto } from '$app/navigation';

	import { page } from '$app/stores';
	import { verifyEmail } from '$lib/api/auth';
	import { onMount } from 'svelte';

	onMount(async () => {
		const token = $page.url.searchParams.get('token');

		if (token) {
			await verifyEmail(token);
		}

		goto('/', { replaceState: true });
	});
</script>
