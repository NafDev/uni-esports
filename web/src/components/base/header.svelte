<script lang="ts">
	import { goto } from '$app/navigation';

	import { ArrowLeftOnRectangle, Bars3 } from '@steeze-ui/heroicons';
	import { Icon } from '@steeze-ui/svelte-icon';

	import { signOut } from '$/lib/api/auth';

	export let mobileSidebarActive: boolean;
	export let signedIn: boolean;
</script>

<div class="my-5 flex h-20 w-full shrink-0 items-center justify-between">
	<button
		class="flex h-12 w-12 items-center justify-center rounded-full transition-colors hover:bg-white/10 active:bg-white/25 lg:invisible"
		on:click={() => (mobileSidebarActive = true)}
	>
		<Icon src={Bars3} size="28" />
	</button>

	{#if signedIn}
		<div class="flex w-auto items-center">
			<button class="btn secondary-outlined scale-105" on:click={() => signOut()}>
				Sign out
			</button>
		</div>
	{:else}
		<div class="flex flex-col">
			<button class="btn primary scale-105" on:click={() => goto('/users/signin')}>
				<span class="pr-2"
					><Icon class="stroke-white" src={ArrowLeftOnRectangle} size="16" theme="mini" /></span
				>
				Sign In
			</button>
		</div>
	{/if}
</div>
