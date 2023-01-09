<script lang="ts">
	import { page } from '$app/stores';
	import { isSignedIn, user } from '$lib/stores/auth';

	import {
		AcademicCap,
		Calendar,
		ChartBar,
		ChevronDoubleLeft,
		ClipboardDocumentCheck,
		Home,
		User,
		UserGroup,
		Users,
		ViewColumns
	} from '@steeze-ui/heroicons';
	import { Icon } from '@steeze-ui/svelte-icon';

	import csgo from '$/images/icons/csgo.png?w=20&imagetools';
	import league from '$/images/icons/league.png?w=20&imagetools';
	import logo from '$/images/icons/logo.png?w=20&imagetools';
	import overwatch from '$/images/icons/overwatch.png?w=20&imagetools';
	import rocket from '$/images/icons/rocket.png?w=20&imagetools';
	import siege from '$/images/icons/siege.png?w=20&imagetools';
	import valorant from '$/images/icons/valorant.png?w=18&imagetools';

	export let mobileSidebarActive: boolean;

	type QuickLink = {
		name: string;
		link: string;
		icon: any; // eslint-disable-line @typescript-eslint/no-explicit-any
		signedIn?: true;
		disabled?: true;
	};

	type GameQuickLink = QuickLink & {
		iconBg: string;
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
			icon: ViewColumns,
			disabled: true
		},
		{
			name: 'Calender',
			link: '/calender',
			icon: Calendar,
			disabled: true
		},
		{
			name: 'My Teams',
			link: '/teams',
			icon: UserGroup,
			signedIn: true
		},
		{
			name: 'Profile',
			link: '/users/me',
			icon: User,
			signedIn: true
		}
	];

	const adminLinks: Array<QuickLink> = [
		{
			name: 'Manage Users',
			link: '/admin/users/list',
			icon: Users
		},
		{
			name: 'Manage Universities',
			link: '/admin/universities/list',
			icon: AcademicCap
		},
		{
			name: 'Manage Tournaments',
			link: '/admin/tournaments/list',
			icon: ChartBar
		},
		{
			name: 'Manage Matches',
			link: '/admin/matches/list',
			icon: ClipboardDocumentCheck
		},
		{
			name: 'Manage Teams',
			link: '/admin/teams/list',
			icon: UserGroup
		}
	];

	const gameLinks: Array<GameQuickLink> = [
		{
			name: 'Counter-Strike: GO',
			link: '/games/csgo',
			icon: csgo,
			iconBg: 'bg-game-csgo'
		},
		{
			name: 'League of Legends',
			link: '/games/league-of-legends',
			icon: league,
			disabled: true,
			iconBg: 'bg-game-league'
		},
		{
			name: 'Valorant',
			link: '/games/valorant',
			icon: valorant,
			disabled: true,
			iconBg: 'bg-game-valorant'
		},
		{
			name: 'Overwatch',
			link: '/games/overwatch',
			icon: overwatch,
			disabled: true,
			iconBg: 'bg-game-overwatch'
		},
		{
			name: 'Rainbow Six: Siege',
			link: '/games/r6siege',
			icon: siege,
			disabled: true,
			iconBg: 'bg-game-siege'
		},
		{
			name: 'Rocket League',
			link: '/games/rocket-league',
			icon: rocket,
			disabled: true,
			iconBg: 'bg-game-rcktlg'
		}
	];

	let activeLink = '/';
	const aggregatedLinks: Array<string> = Array.prototype
		.concat(quickLinks, adminLinks, gameLinks)
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

<div
	class="relative flex h-full flex-col overflow-auto bg-gradient-to-b from-blue-300 to-blue-100 py-14 lg:bg-none"
>
	<!-- Mobile Sidebar Close Chevron -->
	<button
		class="absolute left-[270px] top-[48px] z-40 flex h-12 w-12 items-center justify-center rounded-full transition-colors hover:bg-white/10 active:bg-white/25 lg:hidden"
		on:click={() => (mobileSidebarActive = false)}
	>
		<Icon src={ChevronDoubleLeft} size="28" />
	</button>

	<!-- Sidebar top logo -->
	<div class="pl-12 pb-4">
		<a href="/">
			<img class="h-8 w-8" src={logo} alt="logo" />
		</a>
	</div>

	<div class="p-10 text-xl font-bold">
		<div class="py-4">
			{#each quickLinks as quickLink}
				{#if !quickLink.signedIn || $isSignedIn}
					<a
						href={quickLink.link}
						aria-selected={activeLink === quickLink.link}
						class="group"
						class:pointer-events-none={quickLink.disabled}
						class:brightness-75={quickLink.disabled}
						class:disabled={quickLink.disabled}
					>
						<div class="flex items-center pb-6">
							<span class="pr-4">
								<Icon
									src={quickLink.icon}
									size="24"
									theme="solid"
									class="fill-grey-700 group-hover:fill-grey-950 group-aria-selected:fill-grey-950"
								/>
							</span>
							<p class="text-grey-700 group-hover:text-grey-950  group-aria-selected:text-grey-950">
								{quickLink.name}
							</p>
						</div>
					</a>
				{/if}
			{/each}
		</div>

		{#if $isSignedIn && $user.roles.includes('ADMIN')}
			<div class="py-4">
				{#each adminLinks as quickLink}
					<a href={quickLink.link} aria-selected={activeLink === quickLink.link} class="group">
						<div class="flex items-center pb-6">
							<span class="pr-4">
								<Icon
									src={quickLink.icon}
									size="24"
									theme="solid"
									class="fill-grey-700 group-hover:fill-grey-950 group-aria-selected:fill-grey-950"
								/>
							</span>
							<p class="text-grey-700 group-hover:text-grey-950  group-aria-selected:text-grey-950">
								{quickLink.name}
							</p>
						</div>
					</a>
				{/each}
			</div>
		{/if}
	</div>

	<p class="pl-16 text-lg font-bold">GAMES</p>

	<ul class="px-10 pt-4 font-bold">
		{#each gameLinks as gameLink}
			<a class:pointer-events-none={gameLink.disabled} href={gameLink.link}>
				<li
					class="group mb-5 flex items-center text-xl text-grey-700 hover:text-grey-950 aria-selected:text-grey-950"
					class:brightness-75={gameLink.disabled}
					class:disabled={gameLink.disabled}
					aria-selected={activeLink === gameLink.link}
				>
					<span
						class={`${gameLink.iconBg} mr-4 flex h-7 w-7 items-center justify-center rounded-md p-1 brightness-90 group-hover:brightness-100 group-aria-selected:brightness-100`}
					>
						<img src={gameLink.icon} alt={`${gameLink.name}`} />
					</span>
					{gameLink.name}
				</li>
			</a>
		{/each}
	</ul>

	<hr class="invisible mb-auto" />

	<p class="mt-14 text-center text-grey-700">UK UNIVERSITY ESPORTS 2022</p>
</div>
