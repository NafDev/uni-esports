<script lang="ts">
	import { XMark } from '@steeze-ui/heroicons';

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
		class="absolute top-0 right-0 z-[98] flex h-screen w-screen items-center justify-center bg-black/30"
		transition:fade={{ duration: 100 }}
	>
		<!-- Modal body -->
		<div
			class="relative z-[99] flex h-auto min-h-fit rounded-md bg-gradient-to-b from-blue-300 to-blue-200"
		>
			<button
				on:click={() => closeModal()}
				class="absolute right-2 top-2 m-2 aspect-square rounded-full bg-white bg-opacity-5 p-1 hover:bg-opacity-20"
			>
				<Icon src={XMark} size="20" theme="solid" />
			</button>

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
