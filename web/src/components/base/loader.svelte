<script>
	export let width = 25;
</script>

<div class="loader-bars" style="width: {width}px" />

<style lang="postcss">
	.loader-bars {
		aspect-ratio: 1;
		--c: no-repeat linear-gradient(theme(colors.grey.700) 0 0);
		background: var(--c), var(--c), var(--c);
		animation: b6-1 1s infinite, b6-2 1s infinite;
	}

	@keyframes b6-1 {
		0%,
		100% {
			background-size: 20% 100%;
		}
		33%,
		66% {
			background-size: 20% 40%;
		}
	}

	@keyframes b6-2 {
		0%,
		33% {
			background-position: 0 0, 50% 100%, 100% 0;
		}
		66%,
		100% {
			background-position: 0 100%, 50% 0, 100% 100%;
		}
	}
</style>
