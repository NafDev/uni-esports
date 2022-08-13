<div class="w-screen py-24 text-center">
	<h1 class="py-12 text-5xl font-bold">There's nothing here...</h1>
	<h5>
		The page that you are looking for doesn't exist, or you don't have permission to access it.
	</h5>
</div>

<svelte:head>
	<style>
		@tailwind base;
		@tailwind utilities;
		body {
			background: black;
		}
		.app {
			background: rgb(34, 43, 69);
			background: linear-gradient(180deg, rgba(34, 43, 69, 1) 0%, rgba(29, 33, 50, 1) 100%);
			height: 100vh;
		}
		* {
			font-family: 'Play';
			user-select: none;
			@apply text-greyText;
		}
	</style>
</svelte:head>
