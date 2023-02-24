<script lang="ts">
	import HeadTitle from '$/components/base/headTitle.svelte';
	import Loader from '$/components/base/loader.svelte';
	import PageTitle from '$/components/base/pageTitle.svelte';
	import ancient from '$/images/maps/csgo/ancient.jpg?w=100&imagetools';
	import anubis from '$/images/maps/csgo/anubis.jpg?w=100&imagetools';
	import inferno from '$/images/maps/csgo/inferno.jpg?w=100&imagetools';
	import mirage from '$/images/maps/csgo/mirage.jpg?w=100&imagetools';
	import nuke from '$/images/maps/csgo/nuke.jpg?w=100&imagetools';
	import overpass from '$/images/maps/csgo/overpass.jpg?w=100&imagetools';
	import placeholder from '$/images/maps/csgo/placeholder.png?w=100&imagetools';
	import vertigo from '$/images/maps/csgo/vertigo.jpg?w=100&imagetools';

	import { browser } from '$app/environment';
	import { sse } from '$lib/api/http';
	import { sendVetoRequest } from '$lib/api/matches';
	import { isSignedIn, userInfo } from '$lib/stores/auth';
	import { gameStore } from '$lib/stores/games';
	import { formatSeconds } from '$lib/util';
	import { VipCrown } from '@steeze-ui/remix-icons';
	import { Icon } from '@steeze-ui/svelte-icon';
	import type { MatchService } from '@uni-esports/interfaces';
	import type { PageData } from './$types';

	export let data: PageData;

	$: showScores = data.status === 'Match complete' || data.status === 'Match in progress';
	$: team1 = data.teams.find((team) => team.teamNumber === 1);
	$: team2 = data.teams.find((team) => team.teamNumber === 2);
	$: winningTeam = data.teams.sort((teamA, teamB) => (teamA.score > teamB.score ? -1 : 1)).at(0);
	$: hasVetoHand =
		$isSignedIn &&
		$userInfo.id === vetoingTeam?.members.find((player) => player.id && player.captain)?.id;

	let updateVetoTimerId: number;
	let secondsTillVetoStart = (data.startTime.getTime() - Date.now()) / 1000;
	let serverLoading = false;
	let isPlayer =
		data.userStore?.id &&
		Array.prototype
			.concat(data.teams[0].members, data.teams[1].members)
			.find((player) => player.id === data.userStore.id);

	if (browser && !data.map && !data.vetoOngoing) {
		let inter = setInterval(() => {
			secondsTillVetoStart >= 0 ? (secondsTillVetoStart -= 1) : clearInterval(inter);
		}, 1000);
	}

	const formatDate = new Intl.DateTimeFormat('en-GB', {
		day: 'numeric',
		month: 'long',
		year: 'numeric',
		hour: 'numeric',
		minute: 'numeric'
	});

	const maps: Map<string, { displayName: string; thumb: string }> = new Map([
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

	let vetoingTeam: typeof team1;
	$: {
		if (Array.isArray(vetoedMaps)) {
			vetoingTeam = vetoedMaps.length % 2 === 0 ? team1 : team2;
		}
	}
	let vetoTimeoutSecs: number;

	if (data.vetoStatus) {
		updateVetoTimer(new Date(data.vetoStatus.time));
	}

	if (data.status !== 'Match complete' && data.status !== 'Match cancelled') {
		let eventSource: EventSource;
		eventSource = sse(
			`/matches/${data.id}/events`,
			{
				type: 'veto_start',
				fn: (event: MessageEvent<string>) => {
					console.log(event.data);

					updateVetoTimer(new Date());

					vetoedMaps = [];

					data = { ...data, status: 'Veto in progress', vetoOngoing: true };
				}
			},
			{
				type: 'veto_update',
				fn: (event: MessageEvent<string>) => {
					const data: MatchService['match.veto.update'] = JSON.parse(event.data);
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

					serverLoading = true;
				}
			},
			{
				type: 'match_server',
				fn: (event: MessageEvent) => {
					const eventData: MatchService['match.server.start'] = JSON.parse(event.data);
					console.log(eventData);

					serverLoading = false;
					data = { ...data, connectString: eventData.connectString };
				}
			},
			{
				type: 'match_end',
				fn: (event: MessageEvent) => {
					const eventData: MatchService['match_end'] = JSON.parse(event.data);

					data = {
						...data,
						status: 'Match complete'
					};

					team1 = { ...team1, score: eventData.team1Score };
					team2 = { ...team2, score: eventData.team2Score };

					eventSource.close();
				}
			},
			{
				type: 'match_round',
				fn: (event: MessageEvent) => {
					const eventData: MatchService['match_round'] = JSON.parse(event.data);

					team1 = { ...team1, score: eventData.team1Score };
					team2 = { ...team2, score: eventData.team2Score };
				}
			}
		);
	}

	function updateVetoTimer(lastVetoTime: Date) {
		clearInterval(updateVetoTimerId);

		const secondsSinceLastVeto = (Date.now() - lastVetoTime.getTime()) / 1000;

		vetoTimeoutSecs = 30 - Math.floor(secondsSinceLastVeto);

		updateVetoTimerId = setInterval(() => {
			if (vetoTimeoutSecs > 0) {
				vetoTimeoutSecs = vetoTimeoutSecs - 1;
			} else {
				clearInterval(updateVetoTimerId);
			}
		}, 1000) as unknown as number;
	}

	function doVeto(veto: string) {
		sendVetoRequest(data.id, { gameId: 'csgo', teamId: vetoingTeam.id, veto });
	}
</script>

<HeadTitle value="Match room" />
<PageTitle value="Match room" />

<h2 class="text- mb-1 font-bold text-grey-950">
	{$gameStore.get(data.gameId)?.displayName ?? 'Counter-Strike: Global Offensive'}
</h2>
<h2 class="font-bold text-grey-700">Scrim</h2>

<div class="my-4 flex flex-col items-center">
	<p class="my-2 text-xl font-bold">{data.status}</p>
	<p class="my-2 text-sm font-bold">{formatDate.format(data.startTime)}</p>
	<p class="text-sm font-bold">Best of 1</p>
</div>

<div class="relative mt-10 flex flex-row flex-wrap justify-center gap-8 2xl:justify-between">
	<div class="static left-0 right-0 mx-auto w-full rounded-2xl 2xl:absolute 2xl:w-[320px]">
		<div class="mx-auto w-[320px] max-w-full">
			{#if !data.vetoOngoing}
				{#if data.map || secondsTillVetoStart > 60 * 15}
					<p class="mt-4 text-center font-bold">Map</p>
				{:else}
					<p class="mt-4 text-center font-bold">
						Map veto starts in {formatSeconds(secondsTillVetoStart)}
					</p>
				{/if}
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
				{#if isPlayer && serverLoading}
					<div class="my-10 flex w-full justify-center">
						<Loader />
					</div>
				{/if}
				{#if data.status === 'Match in progress' && data.connectString}
					<div class="flex flex-col">
						<a
							class="self-center"
							href={`steam://rungame/730/76561202255233023/+${data.connectString}`}
						>
							<button class="btn primary my-2 mb-4">Connect to game server</button>
						</a>
						<p class="mb-2 text-center text-xs text-grey-700">
							If button above does not work, copy the connect command below and paste into your game
							console
						</p>
						<p>Server connect command</p>
						<div class="mt-1 w-full select-all rounded-md bg-white bg-opacity-5 p-2.5 text-sm">
							{data.connectString}
						</div>
					</div>
				{/if}
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
						{#if hasVetoHand}
							<button class="btn primary mr-2" on:click={() => doVeto(map)}>Veto</button>
						{/if}
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
	</div>

	<div
		class="relative h-fit w-[360px] rounded-2xl border-primary bg-gradient-to-br from-[#4F6694]/20 to-transparent p-8"
		class:border-2={data.status === 'Match complete' && winningTeam.id === team1.id}
	>
		{#if showScores}
			<div class="mb-4 flex flex-col items-center 2xl:absolute 2xl:-top-24 2xl:left-36">
				<p class="text-xl font-bold text-grey-700">Score</p>
				<p class="text-xl font-bold text-grey-950">{team1.score ?? 0}</p>
			</div>
		{/if}

		<a href={`/teams/${team1.id}`} class="">
			<p class="mb-2 origin-left text-xl font-bold transition-transform hover:scale-105">
				{team1.name}
			</p>
		</a>
		<p class="text-grey-700">{team1.university}</p>

		{#each team1.members as player}
			<div class="my-4 flex items-center gap-4 rounded-lg bg-grey-700/10 p-6">
				<div class="w-5">
					{#if player.captain}<Icon class="fill-gold" src={VipCrown} theme="solid" size="20" />{/if}
				</div>
				<p class="mr-auto font-bold">{player.username}</p>
				<!-- <div class="h-4 w-4 bg-white/10" /> -->
			</div>
		{/each}
	</div>

	<div
		class="relative h-fit w-[360px] rounded-2xl border-primary bg-gradient-to-bl from-[#4F6694]/20 to-transparent p-8"
		class:border-2={data.status === 'Match complete' && winningTeam.id === team2.id}
	>
		{#if showScores}
			<div class="mb-4 flex flex-col items-center 2xl:absolute 2xl:-top-24 2xl:left-36">
				<p class="text-xl font-bold text-grey-700">Score</p>
				<p class="text-xl font-bold text-grey-950">{team2.score ?? 0}</p>
			</div>
		{/if}

		<a href={`/teams/${team2.id}`} class="">
			<p
				class="mb-2 origin-right text-right text-xl font-bold transition-transform hover:scale-105"
			>
				{team2.name}
			</p>
		</a>
		<p class="text-right text-grey-700">{team2.university}</p>

		{#each team2.members as player}
			<div class="my-4 flex flex-row-reverse items-center gap-4 rounded-lg bg-grey-700/10 p-6">
				<div class="w-5">
					{#if player.captain}<Icon class="fill-gold" src={VipCrown} theme="solid" size="20" />{/if}
				</div>
				<p class="ml-auto text-right font-bold">{player.username}</p>
				<!-- <div class="h-4 w-4 bg-white/10" /> -->
			</div>
		{/each}
	</div>

	<div class="mt-auto flex w-full justify-center">
		<p class="select-text text-xs text-grey-700">Match ID: {data.id}</p>
	</div>
</div>
