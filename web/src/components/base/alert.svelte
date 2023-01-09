<script lang="ts">
	import '../../css/notifications.css';

	import { CheckCircle, ExclamationCircle, InformationCircle, XMark } from '@steeze-ui/heroicons';
	import { Icon } from '@steeze-ui/svelte-icon';

	export let type: 'primary' | 'warning' | 'danger' | 'success';
	export let heading: string = undefined;
	export let message: string;
	export let removeNotification: () => void;

	let icon =
		(type === 'primary' && InformationCircle) ||
		(type === 'danger' && ExclamationCircle) ||
		(type === 'warning' && ExclamationCircle) ||
		(type === 'success' && CheckCircle);
</script>

<div
	class="notification relative {type} mx-4 my-3 flex max-h-60 min-h-[7.5rem] w-80 flex-row rounded-lg border-l-8 bg-gradient-to-tr from-blue-100 to-blue-300 shadow-xl"
>
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<span
		on:click={() => removeNotification()}
		class="absolute top-0 right-0 m-2 rounded-full bg-white bg-opacity-5 hover:bg-opacity-20"
	>
		<Icon src={XMark} size="16" theme="solid" />
	</span>
	<div class="flex flex-row items-center justify-center px-4 py-4">
		<span class="mr-4"><Icon src={icon} size="28" theme="solid" /></span>
		<div class="inline max-h-full w-full overflow-auto align-middle font-bold">
			{#if heading}
				<header class="mb-1 text-xl font-bold text-grey-950">{heading}</header>
			{/if}
			<p>{message}</p>
		</div>
	</div>
</div>
