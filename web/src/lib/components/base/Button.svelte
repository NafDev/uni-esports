<script lang="ts">
	import './base.css';
	import Loader from './Loader.svelte';

	export let label: string;
	export let type: 'primary' | 'secondary' | 'danger';
	export let loading: boolean | undefined = undefined;
</script>

<button class={type || 'primary'} class:loading on:click>
	{#if loading !== undefined}
		<Loader visible={loading} />
	{/if}
	{label}
</button>
