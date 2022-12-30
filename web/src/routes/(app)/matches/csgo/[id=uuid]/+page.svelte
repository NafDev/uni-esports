<script lang="ts">
	import PageTitle from '$/components/base/pageTitle.svelte';
	import placeholder from '$/images/maps/csgo/placeholder.png?w=100&imagetools';
	import ancient from '$/images/maps/csgo/ancient.jpg?w=100&imagetools';
	import anubis from '$/images/maps/csgo/anubis.jpg?w=100&imagetools';
	import inferno from '$/images/maps/csgo/inferno.jpg?w=100&imagetools';
	import mirage from '$/images/maps/csgo/mirage.jpg?w=100&imagetools';
	import nuke from '$/images/maps/csgo/nuke.jpg?w=100&imagetools';
	import overpass from '$/images/maps/csgo/overpass.jpg?w=100&imagetools';
	import vertigo from '$/images/maps/csgo/vertigo.jpg?w=100&imagetools';

	import { gameStore } from '$lib/stores/games';
	import { User } from '@steeze-ui/heroicons';
	import { Icon } from '@steeze-ui/svelte-icon';
	import type { PageData } from './$types';
	import { sse } from '$lib/api/http';
	import type { MatchService } from '@uni-esports/interfaces';

	export let data: PageData;

	$: team1 = data.teams.find((team) => team.teamNumber === 1);
	$: team2 = data.teams.find((team) => team.teamNumber === 2);

	const formatDate = new Intl.DateTimeFormat('en-GB', {
		day: 'numeric',
		month: 'long',
		year: 'numeric',
		hour: 'numeric',
		minute: 'numeric'
	});

	const maps: Map<string, { displayName: string; thumb: any }> = new Map([
		['de_ancient', { displayName: 'Ancient', thumb: ancient }],
		['de_anubis', { displayName: 'Anubis', thumb: anubis }],
		['de_inferno', { displayName: 'Inferno', thumb: inferno }],
		['de_mirage', { displayName: 'Mirage', thumb: mirage }],
		['de_nuke', { displayName: 'Nuke', thumb: nuke }],
		['de_overpass', { displayName: 'Overpass', thumb: overpass }],
		['de_vertigo', { displayName: 'Vertigo', thumb: vertigo }]
	]);
	const mapPool = Array.from(maps.keys());

	let vetoedMaps = data.vetoStatus?.vetoed;
	$: remainingMaps =
		vetoedMaps !== undefined ? mapPool.filter((map) => !vetoedMaps.includes(map)) : undefined;

	let vetoingTeam;
	$: {
		if (Array.isArray(vetoedMaps)) {
			vetoingTeam = vetoedMaps.length % 2 === 0 ? team1 : team2;
		}
	}
	let vetoTimeoutSecs: number;

	if (data.vetoStatus) {
		updateVetoTimer(new Date(data.vetoStatus.time));
	}

	if (data.status !== 'Match complete') {
		sse(
			`/matches/${data.id}/events`,
			{
				type: 'veto_start',
				fn: (event: MessageEvent<MatchService['match.veto.start']>) => {
					console.log(event.data);

					updateVetoTimer(new Date());

					vetoedMaps = [];

					data = { ...data, status: 'Veto in progress', vetoOngoing: true };
				}
			},
			{
				type: 'veto_update',
				fn: (event: MessageEvent<MatchService['match.veto.update']>) => {
					const data: typeof event.data = JSON.parse(event.data as unknown as string);
					console.log(data);

					if (!Array.isArray(vetoedMaps)) vetoedMaps = [];

					vetoedMaps = [...vetoedMaps, data.vetoed];

					updateVetoTimer(new Date(data.time));
				}
			},
			{
				type: 'veto_result',
				fn: (event: MessageEvent<string>) => {
					console.log(event.data);
					data = {
						...data,
						status: 'Match in progress',
						map: event.data,
						vetoOngoing: false
					};
				}
			}
		);
	}

	function updateVetoTimer(lastVetoTime: Date) {
		const secondsSinceLastVeto = (Date.now() - lastVetoTime.getTime()) / 1000;

		vetoTimeoutSecs = 30 - Math.floor(secondsSinceLastVeto);

		const updateTimeout = setInterval(() => {
			if (vetoTimeoutSecs > 0) {
				vetoTimeoutSecs = vetoTimeoutSecs - 1;
			} else {
				clearInterval(updateTimeout);
			}
		}, 1000);
	}
</script>

<PageTitle title="Match room" hasHeading={true} />

<h2 class="text- mb-1 font-bold text-grey-950">
	{$gameStore.get(data.gameId)?.displayName ?? 'Counter-Strike: Global Offensive'}
</h2>
<h2 class="font-bold text-grey-700">Scrim</h2>

<div class="my-4 flex flex-col items-center">
	<p class="my-2 text-xl font-bold">{data.status}</p>
	<p class="my-2 text-sm font-bold">{formatDate.format(data.startTime)}</p>
	<p class="text-sm font-bold">Best of 1</p>
</div>

<div class="mt-10 flex flex-row flex-wrap justify-center gap-8">
	<div class="h-fit w-[360px] rounded-2xl bg-gradient-to-br from-[#4F6694]/20 to-transparent p-8">
		<p class="mb-2 text-xl font-bold">{team1.name}</p>
		<p class="text-grey-700">{team1.university}</p>

		{#each team1.members as player}
			<div class="my-4 flex items-center gap-4 rounded-xl bg-grey-700/10 p-6">
				<div class="h-4 w-4">
					{#if player.captain}<Icon src={User} />{/if}
				</div>
				<p class="mr-auto font-bold">{player.username}</p>
				<div class="h-4 w-4 bg-white/10" />
			</div>
		{/each}
	</div>

	<div class="mx-auto max-w-[320px] flex-1 rounded-2xl">
		{#if !data.vetoOngoing}
			<p class="mt-4 text-center font-bold">Map</p>

			<div
				class="my-4 flex h-12 w-full items-center justify-between overflow-clip rounded-lg bg-gradient-to-tr from-[#283653] to-[#303C56]"
			>
				<div class="flex h-full flex-row items-center">
					<div class="h-full w-20 bg-black">
						<img
							class="h-full w-full object-cover object-center"
							src={data.map ? maps.get(data.map).thumb : placeholder}
							alt=""
						/>
					</div>
					<p class="mx-5 font-bold">{data.map ? maps.get(data.map).displayName : 'TBD'}</p>
				</div>
			</div>
		{:else}
			<p class="mt-4 text-center font-bold">Map Veto</p>
			<p class="mb-4 text-center text-sm font-bold">
				{vetoingTeam?.name ?? team1.name} is voting: {vetoTimeoutSecs ?? 0}s
			</p>
			{#each remainingMaps as map}
				<div
					class="my-4 flex h-12 w-full items-center justify-between overflow-clip rounded-lg bg-gradient-to-tr from-[#283653] to-[#303C56]"
				>
					<div class="flex h-full flex-row items-center">
						<div class="h-full w-20 bg-black">
							<img
								class="h-full w-full object-cover object-center"
								src={maps.get(map).thumb}
								alt=""
							/>
						</div>
						<p class="mx-5 font-bold">{maps.get(map).displayName}</p>
					</div>
					<button class="btn primary mr-1">Veto</button>
				</div>
			{/each}
			{#each vetoedMaps as map}
				<div
					class="group my-4 flex h-12 w-full items-center justify-between overflow-clip rounded-lg bg-gradient-to-tr from-[#283653] to-[#303C56]"
				>
					<div class="flex h-full flex-row items-center">
						<div class="h-full w-20 bg-black grayscale">
							<img
								class="h-full w-full object-cover object-center"
								src={maps.get(map).thumb}
								alt=""
							/>
						</div>
						<p class="mx-5 font-bold text-grey-700">{maps.get(map).displayName}</p>
					</div>
				</div>
			{/each}
		{/if}
	</div>

	<div class="h-fit w-[360px] rounded-2xl bg-gradient-to-bl from-[#4F6694]/20 to-transparent p-8">
		<p class="mb-2 text-right text-xl font-bold">{team2.name}</p>
		<p class="text-right text-grey-700">{team2.university}</p>

		{#each team2.members as player}
			<div class="my-4 flex flex-row-reverse items-center gap-4 rounded-xl bg-grey-700/10 p-6">
				<div class="h-4 w-4">
					{#if player.captain}<Icon src={User} />{/if}
				</div>
				<p class="ml-auto text-right font-bold">{player.username}</p>
				<div class="h-4 w-4 bg-white/10" />
			</div>
		{/each}
	</div>

	<div class="mt-auto flex w-full justify-center">
		<p class="select-text text-xs text-grey-700">Match ID: {data.id}</p>
	</div>
</div>
