<script lang="ts">
	import { ChevronRight } from '@steeze-ui/heroicons';
	import { Icon } from '@steeze-ui/svelte-icon';

	import csgo from '$/images/icons/csgo.png?h=24&imagetools';
	import type { ITeamResult } from '@uni-esports/interfaces';
	import { formatDistanceToNowStrict } from 'date-fns';

	export let matchResults: ITeamResult[];

	function gameIcon(gameId: string) {
		switch (gameId) {
			case 'csgo':
				return csgo;
		}
	}

	function matchSummary(matchResult: ITeamResult): 'Win' | 'Loss' | 'In progress' {
		const { status, teamNumber, teams } = matchResult;
		const team1 = teams.at(0);
		const team2 = teams.at(1);

		if (status === 'Completed') {
			if (teamNumber === team1.teamNumber && team1.score > team2.score) {
				return 'Win';
			}

			return 'Loss';
		}

		return 'In progress';
	}
</script>

{#each matchResults as result}
	<a href={`/matches/${result.gameId}/${result.matchId}`}>
		<div
			class="my-1 flex w-full flex-row items-center justify-between rounded-md border-l-4 py-5 px-4 transition-all hover:scale-105 hover:drop-shadow-lg"
			class:result-win={matchSummary(result) === 'Win'}
			class:result-loss={matchSummary(result) === 'Loss'}
			class:result-nil={matchSummary(result) === 'In progress'}
		>
			<img class="h-6" src={gameIcon(result.gameId)} alt="game icon" />
			<div class="flex grow flex-row items-center justify-between gap-2 px-4">
				<p class="text-lg font-bold">{matchSummary(result)}</p>
				{#if matchSummary(result) !== 'In progress'}
					<div class="flex basis-3/5 flex-row flex-wrap">
						<p class="min-w-fit grow text-lg font-bold">
							{result.teams.at(0).score} — {result.teams.at(1).score}
						</p>
						<p class="min-w-fit text-right">
							{formatDistanceToNowStrict(new Date(result.startTime))} ago
						</p>
					</div>
				{/if}
			</div>
			<Icon src={ChevronRight} size="16" />
		</div>
	</a>
{/each}

<style lang="postcss">
	.result-win {
		@apply border-success bg-gradient-to-r from-success/5 to-secondary/30 hover:from-success/10 hover:to-secondary/30;
	}
	.result-loss {
		@apply border-danger bg-gradient-to-r from-danger/5 to-secondary/30 hover:from-danger/10 hover:to-secondary/30;
	}
	.result-nil {
		@apply border-grey-700 bg-gradient-to-r from-grey-700/5 to-secondary/30 hover:to-secondary/30;
	}
</style>
