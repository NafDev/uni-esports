<script lang="ts">
	import { createTeam } from '$/lib/api/teams';

	import { TEAMNAME_CHECK, TEAMNAME_PROMPT } from '$/lib/config';
	import { inputHandler } from '$/lib/form-inputs';
	import Modal from '../base/modal.svelte';

	export let open: boolean;

	const [nameState, nameHelpers] = inputHandler({
		errorText: TEAMNAME_PROMPT,
		validator: (newValue: string) => TEAMNAME_CHECK.test(newValue)
	});

	let isLoading = false;

	async function doCreateTeam() {
		if (nameHelpers.validate(true)) {
			const res = await createTeam({ teamName: nameState.get().value });
			isLoading = false;

			if (res) {
				open = false;
			}
		}
	}
</script>

<Modal {open}>
	<div class="w-80 md:w-96">
		<h1 class="mb-5 text-xl font-bold">Create a team</h1>

		<form on:submit|preventDefault={() => doCreateTeam()}>
			<label for="teamName">Team name</label>
			<input
				id="teamName"
				type="text"
				class="form mb-4"
				bind:value={$nameState.value}
				on:blur={() => nameHelpers.validate()}
			/>
			<p class="mb-4 text-xs text-danger">
				{$nameState.isValid ? '' : nameHelpers.errorText}
			</p>
			<button class="btn primary" class:isLoading>Create</button>
		</form>
	</div>
</Modal>
