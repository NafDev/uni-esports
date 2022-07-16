<script lang="ts">
	import { user } from '$lib/stores/auth.store';

	// $: {
	// 	console.log($user);
	// }
</script>

<div class="main text-2xl text-white">
	<div class="hero relative h-[250px]">
		<div class="hero__overlay absolute flex h-full w-full opacity-20" />
		<div
			class="hero__image absolute flex h-full w-full flex-col items-center justify-center rounded-lg"
		>
			<h1 class="stroke-white stroke-2 text-4xl font-bold text-white opacity-50 ">UKUE</h1>
			<h1 class="text-4xl font-bold">UKUE</h1>
			<h1 class="text-4xl font-bold opacity-50">UKUE</h1>
		</div>
	</div>

	<div class="event__selection pt-9">
		Events
		<br />
		<ul class="relative top-4 inline w-32 text-[16px]">
			<li class="inline">
				<span class="absolute -left-0 -bottom-3 h-[2px] w-20 bg-[#579CEA]" />FEATURED
			</li>
			<li class="inline pl-16 pr-8 opacity-50 hover:cursor-pointer hover:opacity-100 ">UPCOMING</li>
			<li class="inline pr-8 opacity-50 hover:cursor-pointer hover:opacity-100 ">STARTED</li>
			<li class="inline opacity-50 hover:cursor-pointer hover:opacity-100 " />
			COMPLETED
		</ul>
	</div>
</div>
