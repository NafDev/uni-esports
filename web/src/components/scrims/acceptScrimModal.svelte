<script lang="ts">
	import { invalidate } from '$app/navigation';
	import { acceptScrimRequest } from '$lib/api/scrims';
	import { pushNotification } from '$lib/stores/notifications';
	import Modal from '../base/modal.svelte';
	import OptionSelect from '../base/select/optionSelect.svelte';

	export let open: boolean;
	export let availableTeams: Array<{ value: number; label: string }>;
	export let scrimId: number;

	$: {
		if (!open) {
			scrimId = undefined;
		}
	}

	let selectedTeam: typeof availableTeams[number];

	let isLoading = false;

	$: teamId = typeof selectedTeam?.value === 'number' ? selectedTeam.value : undefined;
	$: acceptButtonDisabled = typeof teamId !== 'number';

	async function doCreateScrim() {
		if (teamId) {
			isLoading = true;

			const response = await acceptScrimRequest({ scrimId, teamId });

			isLoading = false;
			if (response) {
				pushNotification({
					type: 'success',
					heading: 'Scrim Accepted',
					message: 'You can now see the scheduled match on the home page.'
				});

				open = false;

				await invalidate('game:data');
			}
		}
	}
</script>

<Modal bind:open>
	<div class="flex w-full flex-col">
		<h1 class="mb-5 text-xl font-bold">Create a scrim</h1>

		<form class="flex w-full flex-col self-center" on:submit|preventDefault={() => doCreateScrim()}>
			<div class="flex flex-col gap-5">
				<div>
					<p>Team</p>
					<OptionSelect options={availableTeams} bind:selectedValue={selectedTeam} />
				</div>
			</div>
			<button
				class="btn primary mt-6 max-w-fit place-self-end"
				class:isLoading
				disabled={acceptButtonDisabled}
			>
				Accept scrim
			</button>
		</form>
	</div>
</Modal>
