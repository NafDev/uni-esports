<script lang="ts">
	import { onMount } from 'svelte';

	export let type: string;
	export let data: string;

	let colourScheme: string;

	onMount(() => {
		if (type === 'warning') colourScheme = 'E29A11';
		else if (type === 'danger') colourScheme = 'D44448';
		else if (type === 'success') colourScheme = '3FA98D';
	});
</script>

<div class="z-10 float-right  mx-4 my-3 flex h-20 flex-row rounded-lg  bg-[#1F2537] shadow-xl">
	<div class="relative bg-[#{colourScheme}] h-full w-2 rounded-tl-lg rounded-bl-lg" />
	<div class="relative flex flex-row justify-center px-4 py-4 ">
		<svg
			xmlns="http://www.w3.org/2000/svg"
			class="h-6 w-6 text-[#{colourScheme}]"
			fill="none"
			viewBox="0 0 24 24"
			stroke="currentColor"
			stroke-width="2"
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
			/>
		</svg>
		<div class="pr-28">
			<p class="-mt-1 pl-4 text-lg font-bold uppercase text-white">{type}</p>
			<p class="text-md -mt-1 pl-4 font-bold text-white opacity-50">
				{data}
			</p>
		</div>
	</div>
</div>
