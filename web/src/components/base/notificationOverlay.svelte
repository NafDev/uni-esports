<script lang="ts">
	import Alert from '$/components/base/alert.svelte';
	import { notificationStore } from '$lib/stores/notifications';
	import { expoOut } from 'svelte/easing';
	import { fly } from 'svelte/transition';
</script>

<div class="absolute bottom-0 right-0 z-[100] flex flex-col items-end justify-end overflow-clip">
	{#each $notificationStore as n (n.id)}
		<div in:fly={{ x: 1000, easing: expoOut }} out:fly={{ x: 500 }}>
			<Alert
				message={n.message}
				type={n.type}
				heading={n.heading}
				removeNotification={n.removeNotification}
			/>
		</div>
	{/each}
</div>
