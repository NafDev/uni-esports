<script lang="ts">
	import { createTeam } from '$/lib/api/teams';

	import { TEAMNAME_CHECK, TEAMNAME_PROMPT } from '$/lib/config';
	import { inputHandler } from '$/lib/form-inputs';
	import { createEventDispatcher } from 'svelte';
	import Modal from '../base/modal.svelte';

	const dispatch = createEventDispatcher();

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
				dispatch('success');
			}
		}
	}
</script>

<Modal bind:open>
	<div class="flex w-full flex-col">
		<h1 class="mb-5 text-xl font-bold">Create a team</h1>

		<form class="w-full self-center" on:submit|preventDefault={() => doCreateTeam()}>
			<label for="teamName">Team name</label>
			<input
				id="teamName"
				type="text"
				class="form mb-4 w-full"
				bind:value={$nameState.value}
				on:blur={() => nameHelpers.validate()}
			/>
			<p class="mb-6 text-xs text-danger">
				{$nameState.isValid ? '' : nameHelpers.errorText}
			</p>
			<button class="btn primary" class:isLoading>Create</button>
		</form>
	</div>
</Modal>
