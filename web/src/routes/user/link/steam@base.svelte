<script lang="ts">
	import { page } from '$app/stores';
	import { steamAuthLink } from '$lib/api/auth';
	import type { SteamOpenIdParameters } from '@uni-esports/interfaces';
	import { onMount } from 'svelte';

	onMount(async () => {
		const headers = Object.fromEntries($page.url.searchParams.entries());

		await steamAuthLink(headers as unknown as SteamOpenIdParameters);
	});
</script>
