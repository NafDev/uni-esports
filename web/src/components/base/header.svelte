<script lang="ts">
	import { goto } from '$app/navigation';

	import { Login, Logout, Menu } from '@steeze-ui/heroicons';
	import { Icon } from '@steeze-ui/svelte-icon';

	import { isSignedIn, user } from '$lib/stores/auth.store';
	import { signOut } from '$lib/api/auth';

	export let mobileSidebarActive: boolean;
</script>

<div class="my-5 flex h-20 w-full items-center justify-between">
	<button
		class="flex h-12 w-12 items-center justify-center rounded-full transition-colors hover:bg-white/10 active:bg-white/25 lg:invisible"
		on:click={() => (mobileSidebarActive = true)}
	>
		<Icon src={Menu} size="28" />
	</button>

	{#if $isSignedIn}
		<div class="flex w-auto items-center">
			<button
				class="flex h-12 w-12 items-center justify-center rounded-full transition-colors hover:bg-white/10 active:bg-white/25"
				on:click={() => signOut()}
			>
				<Icon src={Logout} size="28" />
			</button>
			<img
				src={`https://avatars.dicebear.com/api/identicon/${$user.id}.svg`}
				alt="profile"
				class="ml-5 h-16 rounded-lg"
			/>
		</div>
	{:else}
		<div class="flex flex-col">
			<button class="btn primary" on:click={() => goto('/user/signin')}>
				<span class="pr-2"><Icon class="stroke-white" src={Login} size="16" /></span>
				Sign In
			</button>
		</div>
	{/if}
</div>
