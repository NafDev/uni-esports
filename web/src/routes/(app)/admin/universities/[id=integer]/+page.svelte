<script lang="ts">
	import ConfirmationModal from '$/components/base/confirmationModal.svelte';
	import {
		addUniDomain,
		getUniDetails,
		removeUniDomain,
		updateUniName
	} from '$lib/api/universities';
	import { inputHandler } from '$lib/form-inputs';
	import { Deferred } from '$lib/util';
	import type { IUniversity, IUniversityAdminView } from '@uni-esports/interfaces';
	import type { PageData } from './$types';

	export let data: PageData;

	let uniDetails: IUniversity & IUniversityAdminView = data.uniDetails;

	let deferredAction: Deferred;
	let modalOpen = false;
	let modalProps: {
		title?: string;
		body?: string;
		confirmBtnText?: string;
		confirmBtnType: 'primary' | 'danger' | 'warning';
	};

	const [name, nameHandler] = inputHandler({
		initialValue: uniDetails.name
	});

	const [domainInput] = inputHandler<string>();

	async function doActionWithConfirm<T extends (...params: Parameters<T>) => Promise<unknown>>(
		props: typeof modalProps,
		action: T,
		...params: Parameters<T>
	) {
		deferredAction = new Deferred();

		modalProps = props;
		modalOpen = true;

		try {
			const confirm = await deferredAction.promise;

			if (confirm === 'OK') {
				await action(...params);
				uniDetails = await getUniDetails(uniDetails.id);
			}
		} finally {
			modalOpen = false;
			modalProps = undefined;
		}
	}

	function doUpdateUniName() {
		doActionWithConfirm(
			{
				confirmBtnType: 'primary',
				body: `Are you sure you want to rename this university from <b>${
					uniDetails.name
				}</b> to <b>${name.get().value}</b>?`,
				confirmBtnText: 'Rename'
			},
			updateUniName,
			uniDetails.id,
			name.get().value
		);
	}

	function doAddDomain() {
		doActionWithConfirm(
			{
				confirmBtnType: 'primary',
				body: `Are you sure you want to associate <b>${
					domainInput.get().value
				}</b> as a domain for ${uniDetails.name}?`,
				confirmBtnText: 'Add'
			},
			addUniDomain,
			uniDetails.id,
			domainInput.get().value
		);
	}

	function doRemoveDomain(domain: string) {
		doActionWithConfirm(
			{
				confirmBtnType: 'danger',
				body: `Are you sure you want to remove <b>${domainInput.get().value}</b> as a domain for ${
					uniDetails.name
				}?`,
				confirmBtnText: 'Remove'
			},
			removeUniDomain,
			uniDetails.id,
			domain
		);
	}
</script>

<ConfirmationModal
	bind:open={modalOpen}
	{...modalProps}
	on:clickConfirm={() => deferredAction.resolve('OK')}
	on:clickCancel={() => deferredAction.resolve('CANCEL')}
	on:dismiss={() => deferredAction.resolve('DISMISS')}
/>

<div class="flex flex-row flex-wrap justify-items-stretch">
	<!-- Generic Profile Fields -->
	<div class="flex grow basis-full flex-col p-3 md:basis-1/2">
		<p class="mb-7 text-xl font-bold">University Information</p>

		<label for="uid">ID</label>
		<input class="form mb-5" id="uid" value={uniDetails.id} disabled />

		<label for="name">University Name</label>
		<div class="mb-5 flex flex-row flex-wrap items-center justify-end gap-y-2">
			<input
				class="form w-min grow"
				type="name"
				id="name"
				bind:value={$name.value}
				on:input={() => nameHandler.validate()}
			/>
			<button class="btn primary ml-4" on:click={() => doUpdateUniName()}> Update </button>
		</div>

		<label for="username">Domains</label>
		<div class="flex flex-col items-center gap-4">
			<div class="flex w-full flex-row items-center gap-4">
				<input
					type="text"
					class="form grow"
					placeholder="Add new domain"
					bind:value={$domainInput.value}
				/>
				<button
					class="btn primary"
					disabled={!$domainInput.value.length}
					on:click={() => doAddDomain()}>Update</button
				>
			</div>

			{#each uniDetails.domains as domain}
				<div class="flex w-full flex-row items-center gap-4">
					<input type="text" class="form grow" value={domain} disabled />
					<button class="btn danger" on:click={() => doRemoveDomain(domain)}>Remove</button>
				</div>
			{/each}
		</div>
	</div>
</div>
