<script lang="ts">
	import PageTitle from '$/components/base/pageTitle.svelte';
	import MatchCard from '$/components/card/matchCard.svelte';
	import { isSignedIn, userInfo } from '$lib/stores/auth';
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<PageTitle title="Home" hasHeading={false} />

<h1 class="overflow-x-autotext-left mb-6 text-3xl font-black lg:mt-6">
	Welcome to UKUE{$isSignedIn && $userInfo?.username ? `, ${userInfo.get().username}` : ''}
</h1>

{#if data.upcomingMatches && data.upcomingMatches.length > 0}
	<h2 class="my-10 pl-10 font-bold">{$isSignedIn === true ? 'Your ' : ''}Upcoming Matches</h2>

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
{/if}

<h2 class="my-10 pl-10 font-bold">Upcoming Tournaments</h2>
<p>There are currently no upcoming tournaments, check back another time!</p>
