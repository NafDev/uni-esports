<script lang="ts">
	import { Calendar, ChevronDoubleLeft, Home, ViewBoards } from '@steeze-ui/heroicons';
	import { Icon } from '@steeze-ui/svelte-icon';

	import csgo from './images/csgo.png';
	import league from './images/league.png';
	import logo from './images/logo.png';
	import overwatch from './images/overwatch.png';
	import rocket from './images/rocket.png';
	import siege from './images/siege.png';
	import valorant from './images/valorant.png';

	export let mobileSidebarActive: boolean;

	let selectedQuickAction = 'Dashboard';
</script>

<div class="relative flex h-full flex-col overflow-auto bg-[#1F2537] py-11 lg:py-14">
	<button
		class="absolute left-[220px] top-[36px] z-40 flex h-12 w-12 items-center justify-center rounded-full transition-colors hover:bg-white/10 active:bg-white/25 lg:hidden"
		on:click={() => (mobileSidebarActive = false)}
	>
		<Icon src={ChevronDoubleLeft} size="28" />
	</button>

	<div class="pl-12 pb-4 text-3xl font-bold text-white ">
		<img class="h-8 w-8" src={logo} alt="logo" />
	</div>
	<!-- <div class=" relative text-white font-bold text1xl pl-12 opacity-25">UK University Esports</div> -->

	<ul class="quickActions p-12 text-xl font-bold">
		<li
			class:selected={selectedQuickAction === 'Dashboard'}
			on:click={() => (selectedQuickAction = 'Dashboard')}
		>
			<span class="accent" />
			<span class="actionIcon pr-2"><Icon src={Home} size="28" theme="solid" /></span>
			<p>Dashboard</p>
		</li>
		<li
			class:selected={selectedQuickAction === 'Tournaments'}
			on:click={() => (selectedQuickAction = 'Tournaments')}
		>
			<span class="accent" />
			<span class="actionIcon pr-2"><Icon src={ViewBoards} size="28" theme="solid" /></span>
			<p>Tournaments</p>
		</li>
		<li
			on:click={() => (selectedQuickAction = 'Calendar')}
			class:selected={selectedQuickAction === 'Calendar'}
		>
			<span class="accent" />
			<span class="actionIcon pr-2"><Icon src={Calendar} size="28" theme="solid" /></span>
			<p>Calendar</p>
		</li>
	</ul>

	<p class="pl-12 text-lg font-bold">ACTIVE GAMES</p>

	<ul class="gameOptions text-md pl-20 pt-4 font-bold">
		<li
			on:click={() => (selectedQuickAction = 'CSGO')}
			class:selected={selectedQuickAction === 'CSGO'}
		>
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

	.quickActions > li {
		@apply relative flex items-start pb-4 opacity-50 hover:cursor-pointer hover:opacity-100;
	}
	.quickActions > li.selected {
		@apply opacity-100;
	}
	.quickActions > li > span.accent {
		@apply invisible absolute -left-12 -top-1 h-8 w-1 bg-[#579CEA];
	}
	.quickActions > li.selected > span.accent {
		@apply visible;
	}
</style>
