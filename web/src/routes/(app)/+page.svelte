<script lang="ts">
	import HeadTitle from '$/components/base/headTitle.svelte';
	import PageTitle from '$/components/base/pageTitle.svelte';
	import MatchCard from '$/components/card/matchCard.svelte';
	import { isSignedIn, userInfo } from '$lib/stores/auth';
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<HeadTitle value={'Home'} />

<PageTitle
	value={`Welcome to UKUE${
		$isSignedIn && $userInfo?.username ? `, ${userInfo.get().username}` : ''
	}`}
/>

<h2 class="my-10 text-xl font-bold">
	{$isSignedIn === true ? 'Your ' : ''}Upcoming Matches
</h2>
{#if data.upcomingMatches && data.upcomingMatches.length > 0}
	<div
		class={`flex w-fit flex-wrap ${
			data.upcomingMatches.length < 3 ? 'justify-start' : 'justify-center'
		}`}
	>
		{#each data.upcomingMatches as match}
			<a href={`/matches/${match.gameId}/${match.matchId}`}>
				<MatchCard
					game={match.gameId}
					startTime={new Date(match.time)}
					subheading={match.tournamentId ?? 'Scrim'}
				/>
			</a>
		{/each}
	</div>
{:else}
	<p class="text-grey-700">
		You have no upcoming matches. You can join upcoming tournaments below, or organise a scrim from
		the game pages in the sidebar.
	</p>
{/if}

<h2 class="my-10 text-xl font-bold">Upcoming Tournaments</h2>
<p class="text-grey-700">There are currently no upcoming tournaments, check back another time!</p>
