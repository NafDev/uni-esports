<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import Modal from './modal.svelte';

	export let open: boolean;
	export let title = 'Confirm?';
	export let body = 'Are you sure?';
	export let confirmBtnType: 'primary' | 'danger' | 'warning' = 'primary';
	export let confirmBtnText = 'OK';
	let isLoading = false;

	$: {
		if (open === true) {
			isLoading = false;
		}
	}

	const dispatch = createEventDispatcher();
</script>

<Modal bind:open on:dismiss>
	<h1 class="mb-5 text-xl font-bold">{@html title}</h1>
	<p>{@html body}</p>

	<div class="mt-5 flex justify-end">
		<button class="btn secondary mr-2" on:click={() => dispatch('clickCancel')}>Cancel</button>
		<button
			class={`btn ${confirmBtnType} ml-2`}
			class:isLoading
			on:click={() => {
				isLoading = true;
				dispatch('clickConfirm');
			}}
		>
			{confirmBtnText}
		</button>
	</div>
</Modal>
