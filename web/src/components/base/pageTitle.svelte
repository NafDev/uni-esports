<script lang="ts">
	export let title: string;
	export let hasHeading = true;
</script>

{#if hasHeading}
	<h1
		class="mb-5 overflow-x-auto rounded-3xl bg-opacity-5 bg-gradient-to-t from-black/5 p-10 text-left text-4xl font-black uppercase"
	>
		{title}
	</h1>
{/if}

<svelte:head>
	<title>{title} | UKUE</title>
</svelte:head>
