<script lang="ts">
	import { ChevronRight } from '@steeze-ui/heroicons';
	import { Icon } from '@steeze-ui/svelte-icon';

	let className = '';
	export { className as class };
	let open = false;
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class="flex flex-col {className}">
	<div
		class="flex w-full cursor-pointer flex-row items-center justify-between"
		on:click={() => (open = !open)}
	>
		<div class="grow">
			<slot name="heading" />
		</div>
		<Icon class="transition-transform {open && 'rotate-90'}" src={ChevronRight} size="16" />
	</div>
	{#if open}
		<slot name="content" />
	{/if}
</div>
