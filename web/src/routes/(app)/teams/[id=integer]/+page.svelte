<script lang="ts">
	import HeadTitle from '$/components/base/headTitle.svelte';
	import PageTitle from '$/components/base/pageTitle.svelte';
	import csgo from '$/images/icons/csgo.png?h=24&imagetools';
	import { invitePlayerBySearch } from '$/lib/api/teams';
	import { AcademicCap, ChevronRight } from '@steeze-ui/heroicons';
	import { VipCrown } from '@steeze-ui/remix-icons';
	import { Icon } from '@steeze-ui/svelte-icon';
	import type { ITeamResult } from '@uni-esports/interfaces';
	import type { PageData } from './$types';

	export let data: PageData;
	const { team, isCaptain, teamResults } = data;

	let playerSearch = '';
	let playerSearchIsLoading = false;

	async function doPlayerInvite() {
		if (team && playerSearch !== '' && !playerSearchIsLoading) {
			playerSearchIsLoading = true;

			try {
				await invitePlayerBySearch(team.id, { invitedPlayer: playerSearch });
			} finally {
				playerSearchIsLoading = false;
			}
		}
	}

	function gameIcon(gameId: string) {
		switch (gameId) {
			case 'csgo':
				return csgo;
		}
	}

	function matchSummary(matchResult: ITeamResult): 'Win' | 'Loss' | 'Nil' {
		const { status, teamNumber, team1Score, team2Score } = matchResult;

		if (status === 'Completed') {
			if (teamNumber === 1 && team1Score > team2Score) {
				return 'Win';
			}

			return 'Loss';
		}

		return 'Nil';
	}
</script>

<HeadTitle value={`Team - ${team.name}`} />
<PageTitle value="Team Page" />

<div class="my-8 flex flex-row flex-wrap items-end justify-between">
	<p class="text-xl font-bold">{team.name}</p>
	<div class="flex flex-row items-center">
		<Icon src={AcademicCap} size="24" theme="solid" />
		<p class="ml-3 text-lg font-bold">{team.university}</p>
	</div>
</div>

<div class="flex flex-row flex-wrap">
	<div class="my-6 flex w-full flex-col px-4 md:w-1/2">
		<p class="class mb-3 text-lg font-bold">Players</p>
		{#each team.members as member}
			<div
				class="mb-3 flex flex-row items-center justify-between rounded-md bg-secondary/20 p-5 py-5 px-8 transition-all hover:scale-105 hover:bg-secondary/30 hover:drop-shadow-lg"
			>
				<p class="font-bold">{member.username}</p>
				{#if member.captain}<Icon class="fill-gold" src={VipCrown} theme="solid" size="20" />{/if}
			</div>
		{/each}
	</div>

	<div class="my-6 flex w-full flex-col px-4 md:w-1/2">
		<p class="class mb-3 text-lg font-bold">Recent Matches</p>
		{#if teamResults[0] > 0}
			{#each teamResults[1] as result}
				<a href={`/matches/${result.gameId}/${result.matchId}`}>
					<div
						class="flex w-full flex-row items-center justify-between rounded-md border-l-4 py-5 px-4 transition-all hover:scale-105 hover:drop-shadow-lg"
						class:result-win={matchSummary(result) === 'Win'}
						class:result-loss={matchSummary(result) === 'Loss'}
						class:result-nil={matchSummary(result) === 'Nil'}
					>
						<img class="ml-4 h-6" src={gameIcon(result.gameId)} alt="game icon" />
						<div class="flex grow flex-row justify-around">
							<p class="text text-lg font-bold">{result.team1Score} — {result.team2Score}</p>
							<p class="text-lg font-bold">{matchSummary(result)}</p>
						</div>
						<Icon src={ChevronRight} size="16" />
					</div>
				</a>
			{/each}
		{:else}
			<p class="text-grey-700">This team hasn't played any matches yet.</p>
		{/if}
	</div>

	{#if isCaptain === true}
		<div class="my-6 w-full grow px-4 md:w-1/2">
			<p class="text-bold mb-3 text-lg font-bold">Invite players</p>
			<label for="invitePlayer">Invite player by search</label>
			<div class="mb-2 flex flex-row items-center">
				<input
					type="text"
					class="form"
					id="invitePlayer"
					placeholder="Email or username"
					bind:value={playerSearch}
				/>
				<button
					class="btn primary ml-4"
					class:isLoading={playerSearchIsLoading}
					on:click={() => doPlayerInvite()}>Invite</button
				>
			</div>
		</div>
	{/if}
</div>

<style lang="postcss">
	.result-win {
		@apply border-success bg-gradient-to-r from-success/5 to-secondary/30 hover:from-success/10 hover:to-secondary/30;
	}
	.result-loss {
		@apply border-danger bg-gradient-to-r from-danger/5 to-secondary/30 hover:from-danger/10 hover:to-secondary/30;
	}
	.result-nil {
		@apply border-grey-700 bg-gradient-to-r from-grey-700/5 to-secondary/30 hover:from-danger/10 hover:to-secondary/30;
	}
</style>
