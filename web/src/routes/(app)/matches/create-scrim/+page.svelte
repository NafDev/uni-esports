<script lang="ts">
	import HeadTitle from '$/components/base/headTitle.svelte';
	import PageTitle from '$/components/base/pageTitle.svelte';
	import { gameStore } from '$/lib/stores/games';
	import type { PageData } from './$types';

	export let data: PageData;
	const games = Array.isArray(data.games) ? data.games : Array.from(gameStore.get().values());

	let gameInput = games.at(0);
</script>

<HeadTitle value="Create scrim" />
<PageTitle value={'Create scrim'} />

<p class="mb-3 text-xl font-bold">You can organise a scrim for your team in 3 steps.</p>
<ol class="ml-4 mb-4 list-decimal text-lg font-bold">
	<li><p class="ml-4 font-normal">Select the game you'd like to play.</p></li>
	<li>
		<p class="ml-4 font-normal">
			Select the team you want to organise the match for (you need to be the team captain).
		</p>
	</li>
	<li>
		<p class="ml-4 font-normal">Find the team you'd like to play against.</p>
	</li>
</ol>

<p>
	That's it. You'll then see the game show up in your upcoming games.
	<strong>
		The other team captain will need to accept the match, otherwise the match will be cancelled.
	</strong>
</p>

<div class="flex flex-col p-6">
	<p class="font-bold">Select game</p>
</div>
