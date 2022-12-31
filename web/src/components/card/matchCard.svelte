<script lang="ts">
	import { formatDistanceToNowStrict } from 'date-fns';
	import CsgoBg from '$/images/csgo_generic.jpg?w=320&imagetools';

	export let game: 'csgo' | 'csgo2v2' | 'league' | 'valorant' | 'overwatch' | 'siege' | 'rcktlg';
	export let subheading: string;
	export let startTime: Date;

	let gameTitle;
	let imgSrc;

	switch (game) {
		case 'csgo':
		case 'csgo2v2':
			gameTitle = 'Counter-Strike: Global Offensive';
			imgSrc = CsgoBg;
			break;
		case 'league':
			gameTitle = 'League Of Legends';
			break;
		case 'overwatch':
			gameTitle = 'Overwatch';
			break;
		case 'rcktlg':
			gameTitle = 'Rocket League';
			break;
		case 'siege':
			gameTitle = 'Rainbow Six: Siege';
			break;
		case 'valorant':
			gameTitle = 'Valorant';
			break;
	}
</script>

<div
	class="m-2 flex h-52 w-80 flex-col overflow-clip rounded-xl transition-all hover:scale-105 hover:shadow-lg hover:drop-shadow-xl"
>
	<div class="h-2/5 bg-black">
		<img src={imgSrc} alt="" />
	</div>
	<div class={`game-card-info flex h-3/5 flex-col border-t-4 ${game} px-4 py-3`}>
		<p class="text-lg font-bold">{gameTitle}</p>
		<p>{subheading}</p>
		<div class="flex flex-1 items-center justify-center">
			<p class="font-bold">
				{startTime.getTime() >= Date.now()
					? `Starts in ${formatDistanceToNowStrict(startTime)}`
					: 'In progress'}
			</p>
		</div>
	</div>
</div>

<style lang="postcss">
	.game-card-info {
		background: conic-gradient(from 270deg at 67% -5%, #425989 0deg, #1c3664 360deg);
	}
	.csgo {
		@apply border-game-csgo;
	}
</style>
