<script lang="ts">
	import { joinTeam } from '$/lib/api/teams';
	import { inputHandler } from '$/lib/form-inputs';
	import { createEventDispatcher } from 'svelte';
	import Modal from '../base/modal.svelte';

	export let open: boolean;

	const dispatch = createEventDispatcher();

	const [valueInput, valueHelpers] = inputHandler<string>({
		validator: (value) => value.length > 0
	});

	let isLoading = false;

	async function doJoinTeam() {
		if (valueHelpers.validate(true)) {
			await joinTeam(valueInput.get().value);

			isLoading = false;
			open = false;

			dispatch('success');
		}
	}
</script>

<Modal bind:open>
	<div class="flex w-full flex-col">
		<h1 class="mb-5 text-xl font-bold">Join a team</h1>

		<form class="w-full self-center" on:submit|preventDefault={() => doJoinTeam()}>
			<label for="joinCode">Team join code</label>
			<input id="joinCode" type="text" class="form mb-4 w-full" bind:value={$valueInput.value} />
			<button class="btn primary" class:isLoading>Join</button>
		</form>
	</div>
</Modal>
