<script lang="ts">
	export let title: string;
	export let hasHeading = true;
</script>

{#if hasHeading}
	<h1 class="overflow-x-autotext-left mb-6 text-3xl font-black lg:mt-6">
		{title}
	</h1>
{/if}

<svelte:head>
	<title>{title} | UKUE</title>
</svelte:head>
