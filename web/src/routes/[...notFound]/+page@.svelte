<div class="flex w-screen flex-col items-center  py-24">
	<h1 class="py-12 text-5xl font-bold">There's nothing here...</h1>
	<h5>
		The page that you are looking for doesn't exist, or you don't have permission to access it.
	</h5>
	<a href="/" class="pt-12">
		<button
			class="w-auto items-center justify-around rounded-md bg-primary py-1.5 px-5 text-center text-sm font-bold transition-all duration-300 hover:opacity-90"
			>Go to home page</button
		>
	</a>
</div>

<svelte:head>
	<title>Page not found | UKUE</title>
	<style lang="postcss">
		@tailwind base;
		@tailwind utilities;
		body {
			background: black;
		}
		.app {
			background: linear-gradient(180deg, #283653 5%, #131e2b 95%);
			min-height: 100vh;
		}

		* {
			font-family: 'Play';
			user-select: none;
			@apply text-grey-950;
		}
	</style>
</svelte:head>
