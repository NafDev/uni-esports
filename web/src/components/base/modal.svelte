<script lang="ts">
	import { X } from '@steeze-ui/heroicons';

	import { Icon } from '@steeze-ui/svelte-icon';

	import { fade } from 'svelte/transition';

	export let open: boolean;
</script>

{#if open}
	<div
		class="absolute top-0 right-0 z-40 flex h-screen w-screen items-center justify-center bg-black/20"
		transition:fade={{ duration: 200 }}
	>
		<!-- Modal body -->
		<div class="app relative z-50 h-auto rounded-md" style="min-height: fit-content;">
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<span
				on:click={() => (open = false)}
				class="absolute right-0 top-0 m-2 aspect-square rounded-full bg-white bg-opacity-5 p-1 hover:bg-opacity-20"
			>
				<Icon src={X} size="20" theme="solid" />
			</span>

			<!-- Content -->
			<div class="p-10">
				<slot />
			</div>
		</div>

		<!-- Backdrop -->
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<div class="absolute top-0 right-0 h-full w-full" on:click={() => (open = false)} />
	</div>
{/if}
