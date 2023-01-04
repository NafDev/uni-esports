<script lang="ts">
	import HeadTitle from '$/components/base/headTitle.svelte';
	import PageTitle from '$/components/base/pageTitle.svelte';
	import { createNewMatch } from '$lib/api/admin/matches';
	import { inputHandler } from '$lib/form-inputs';
	import { gameStore } from '$lib/stores/games';

	const [game, gameInput] = inputHandler<string>({
		validator: (input) => Array.from($gameStore.keys()).includes(input)
	});
	const [time, timeInput] = inputHandler<string>({
		validator: (input) => Boolean(input)
	});
	const [team1, team1Input] = inputHandler<number>({
		validator: (input) => Number.isInteger(input)
	});
	const [team2, team2Input] = inputHandler<number>({
		validator: (input) => Number.isInteger(input)
	});

	function doCreateGame() {
		if (
			gameInput.validate() &&
			timeInput.validate() &&
			team1Input.validate() &&
			team2Input.validate()
		) {
			createNewMatch({
				gameId: game.get().value,
				teamIds: [team1.get().value, team2.get().value],
				scheduledStart: new Date(time.get().value).toISOString() as unknown as Date
			});
		}
	}
</script>

<HeadTitle value={'Create match'} />
<PageTitle value="Create match" />

<div class="flex w-full flex-wrap items-end justify-around gap-5">
	<div class="flex grow flex-col">
		<label for="game">Game</label>
		<select class="form" id="game" placeholder="Game" bind:value={$game.value}>
			<option value="">Game filter</option>
			{#each Array.from($gameStore.values()) as game}
				<option value={game.id}>{game.displayName}</option>
			{/each}
		</select>
	</div>

	<div class="flex grow flex-col">
		<label for="startTime">Scheduled Start Time</label>
		<input
			id="startTime"
			type="datetime-local"
			class="form"
			placeholder="Start time"
			bind:value={$time.value}
		/>
	</div>

	<div class="flex grow flex-col">
		<label for="team1">Team 1 ID</label>
		<input id="team1" type="number" class="form" placeholder="ID" bind:value={$team1.value} />
	</div>

	<div class="flex grow flex-col">
		<label for="team2">Team 2 ID</label>
		<input id="startTime" type="number" class="form" placeholder="ID" bind:value={$team2.value} />
	</div>

	<button class="btn primary" on:click={() => doCreateGame()}>Create</button>
</div>
