<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { joinTeam } from '$lib/api/teams';
	import { onMount } from 'svelte';

	onMount(async () => {
		const inviteCode = $page.url.searchParams.get('code');

		if (inviteCode) {
			await joinTeam(inviteCode);
		}

		goto('/', { replaceState: true });
	});
</script>
