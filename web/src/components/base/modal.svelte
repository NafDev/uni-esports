<script lang="ts">
	import { X } from '@steeze-ui/heroicons';

	import { Icon } from '@steeze-ui/svelte-icon';
	import { createEventDispatcher } from 'svelte';

	import { fade } from 'svelte/transition';

	export let open: boolean;

	const dispatch = createEventDispatcher();

	function closeModal() {
		open = false;
		dispatch('dismiss');
	}
</script>

{#if open}
	<div
		class="absolute top-0 right-0 z-40 flex h-screen w-screen items-center justify-center bg-black/30"
		transition:fade={{ duration: 100 }}
	>
		<!-- Modal body -->
		<div class="app relative z-50 h-auto rounded-md" style="min-height: fit-content;">
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<span
				on:click={() => closeModal()}
				class="absolute right-0 top-0 m-2 aspect-square rounded-full bg-white bg-opacity-5 p-1 hover:bg-opacity-20"
			>
				<Icon src={X} size="20" theme="solid" />
			</span>

			<!-- Content -->
			<div class="w-[80vw] p-10 lg:w-[38vw]">
				<slot />
			</div>
		</div>

		<!-- Backdrop -->
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<div class="absolute top-0 right-0 h-full w-full" on:click={() => closeModal()} />
	</div>
{/if}
