<script lang="ts">
	export let gameTitle: string;
	export let startDate: string;
	export let prizing: string;
	export let cardType: string;

	let colourScheme: string;

	if (cardType == 'cs') colourScheme = 'E29A11';
	if (cardType == 'val') colourScheme = 'D44448';
	if (cardType == 'over') colourScheme = 'EE5708';
</script>

<div
	class="card relative mb-0 h-60  w-full  rounded-lg hover:translate-y-1 hover:cursor-pointer hover:shadow-xl  xl:w-[400px]"
>
	<div class="card_overlay absolute z-0 h-full w-full rounded-lg" />
	<div class="card__background__{cardType} relative h-1/2 w-full rounded-tl-lg rounded-tr-lg">
		<div
			class="bg-slate-600 absolute my-4 mx-4 h-auto w-auto rounded px-3 py-1 text-sm font-bold uppercase opacity-75 shadow-lg"
		>
			in 2 days
		</div>
	</div>
	<div class="h-1 w-full bg-[#{colourScheme}] shadow-2xl" />
	<div class="relative flex h-1/2  w-full flex-row rounded-bl-lg rounded-br-lg">
		<div class="flex h-full w-2/3 flex-col ">
			<div class="relative  h-1/2  px-4  py-4 text-sm  ">
				<p class="font-bold text-[#{colourScheme}]">{gameTitle}</p>
				<p class="opacity-50">Professional Series</p>
			</div>

			<div class="relative h-1/2 w-full  px-4 py-2 text-sm font-bold opacity-75">
				<p>Esports Tournament</p>
				<p>{startDate}</p>
			</div>
		</div>
		<div class="flex h-full w-1/3 flex-col ">
			<div class="relative h-1/2 w-full  px-4 py-4 text-right text-sm font-bold">
				<p>Prizing</p>
				<p class="text-[#387867]">${prizing}</p>
			</div>

			<div class="relative h-1/2 w-full  px-4 py-2 text-right text-sm font-bold opacity-75">
				<p>Europe</p>
				<p>8/8 Teams</p>
			</div>
		</div>
	</div>
</div>
