<script lang="ts">
	import { invalidate } from '$app/navigation';
	import { createScrimRequest } from '$lib/api/scrims';
	import { pushNotification } from '$lib/stores/notifications';
	import { add, isAfter } from 'date-fns';
	import Modal from '../base/modal.svelte';
	import OptionSelect from '../base/select/optionSelect.svelte';

	export let open: boolean;
	export let availableTeams: Array<{ value: number; label: string }>;
	export let gameId: string;

	let matchStart: string;
	let selectedTeam: typeof availableTeams[number];

	let isLoading = false;
	let startTime: Date;

	$: teamId = typeof selectedTeam?.value === 'number' ? selectedTeam.value : undefined;
	$: {
		const matchStartTime = new Date(Date.parse(matchStart));
		if (isAfter(matchStartTime, add(Date.now(), { minutes: 30 }))) {
			startTime = matchStartTime;
		} else {
			startTime = undefined;
		}
	}
	$: createButtonEnabled = startTime && teamId;

	async function doCreateScrim() {
		if (teamId && startTime) {
			isLoading = true;

			const response = await createScrimRequest({ gameId, matchStart: startTime, teamId });

			isLoading = false;
			if (response) {
				pushNotification({
					type: 'success',
					message: 'Scrim request created'
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

				<div>
					<label for="startTime">Match Start</label>
					<input type="datetime-local" class="form mb-4 w-full" bind:value={matchStart} />
					<p class="text-sm text-grey-700">
						Match start time needs to be at least 30 minutes from now. Another team will need to
						accept the scrim request at least 15 minutes before the match start time.
					</p>
				</div>
			</div>
			<button
				class="btn primary mt-6 max-w-fit place-self-end"
				class:isLoading
				disabled={!createButtonEnabled}
			>
				Create request
			</button>
		</form>
	</div>
</Modal>
