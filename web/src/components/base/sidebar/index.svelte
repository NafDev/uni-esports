<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { isSignedIn } from '$lib/stores/auth.store';

	import {
		Calendar,
		ChevronDoubleLeft,
		Home,
		ViewBoards,
		User,
		UserGroup
	} from '@steeze-ui/heroicons';
	import type { IconSource } from '@steeze-ui/heroicons/types';
	import { Icon } from '@steeze-ui/svelte-icon';

	import csgo from './images/csgo.png';
	import league from './images/league.png';
	import logo from './images/logo.png';
	import overwatch from './images/overwatch.png';
	import rocket from './images/rocket.png';
	import siege from './images/siege.png';
	import valorant from './images/valorant.png';

	export let mobileSidebarActive: boolean;

	type QuickLink = {
		name: string;
		link: string;
		icon: IconSource;
		signedIn?: true;
	};

	const quickLinks: Array<QuickLink> = [
		{
			name: 'Home',
			link: '/',
			icon: Home
		},
		{
			name: 'Tournaments',
			link: '/tournaments',
			icon: ViewBoards
		},
		{
			name: 'Calender',
			link: '/calender',
			icon: Calendar
		},
		{
			name: 'My Teams',
			link: '/teams',
			icon: UserGroup,
			signedIn: true
		},
		{
			name: 'Profile',
			link: '/user/me',
			icon: User,
			signedIn: true
		}
	];

	let activeLink = '/';
	const aggregatedLinks: Array<string> = Array.prototype
		.concat(quickLinks)
		.map((link) => link.link);

	$: {
		const pathname = $page.url.pathname;

		for (const link of aggregatedLinks) {
			if (pathname.startsWith(link)) {
				activeLink = pathname;
			}
		}
	}
</script>

<div class="relative flex h-full flex-col overflow-auto bg-[#1F2537] py-11 lg:py-14">
	<!-- Mobile Sidebar Close Chevron -->
	<button
		class="absolute left-[220px] top-[36px] z-40 flex h-12 w-12 items-center justify-center rounded-full transition-colors hover:bg-white/10 active:bg-white/25 lg:hidden"
		on:click={() => (mobileSidebarActive = false)}
	>
		<Icon src={ChevronDoubleLeft} size="28" />
	</button>

	<!-- Sidebar top logo -->
	<div class="pl-12 pb-4 text-3xl font-bold text-white ">
		<img class="h-8 w-8" src={logo} alt="logo" />
	</div>

	<div class="quickLinks p-12 text-lg font-bold">
		{#each quickLinks as quickLink}
			{#if !quickLink.signedIn || $isSignedIn}
				<a href={quickLink.link} class:selected={activeLink === quickLink.link}>
					<div class="flex items-center">
						<span class="pr-2"><Icon src={quickLink.icon} size="24" theme="solid" /></span>
						<p>{quickLink.name}</p>
					</div>
				</a>
			{/if}
		{/each}
	</div>

	<p class="pl-12 text-lg font-bold">ACTIVE GAMES</p>

	<ul class="gameOptions text-md pl-20 pt-4 font-bold">
		<li href="/games/csgo" class:selected={activeLink === '/games/csgo'}>
			<span class="bg-[#E29A11]">
				<img src={csgo} class="h-4 w-4 self-center" alt="img" />
			</span>CS: Global Offensive
		</li>
		<li class="disabled">
			<span class="bg-[#579CEA]">
				<img src={league} class="h-4 w-4 self-center" alt="img" />
			</span>League of Legends
		</li>
		<li class="disabled">
			<span class="bg-[#D44448]">
				<img src={valorant} class="h-4 w-4 self-center" alt="img" />
			</span>Valorant
		</li>
		<li class="disabled">
			<span class="bg-[#EE5708]">
				<img src={overwatch} class="h-4 w-4 self-center" alt="img" />
			</span>Overwatch
		</li>
		<li class="disabled">
			<span class="bg-[#101114]">
				<img src={siege} class="h-4 w-4 self-center" alt="img" />
			</span>Rainbow: Six Siege
		</li>
		<li class="disabled">
			<span class="bg-[#579CEA]">
				<img src={rocket} class="h-4 w-4 self-center" alt="img" />
			</span>Rocket League
		</li>
	</ul>

	<hr class="invisible mb-auto" />

	<p class="mt-14 text-center font-bold opacity-50">UK UNIVERSITY ESPORTS 2022</p>
</div>

<style>
	.gameOptions > li {
		@apply relative flex items-center pb-4 opacity-50 hover:cursor-pointer hover:opacity-100;
	}
	.gameOptions > li.selected {
		@apply opacity-100;
	}
	.gameOptions > li.disabled {
		@apply hover:opacity-50;
	}
	.gameOptions > li.disabled > span {
		@apply grayscale;
	}
	.gameOptions > li > span {
		@apply absolute -left-8 inline-block h-6 w-6 rounded-md p-1;
	}

	.quickLinks > a {
		@apply relative flex items-start pb-4 opacity-50 hover:cursor-pointer hover:opacity-100;
	}
	.quickLinks > a.selected {
		@apply opacity-100 before:absolute before:-left-12 before:-top-1 before:h-8 before:w-1 before:bg-primary;
	}
</style>
