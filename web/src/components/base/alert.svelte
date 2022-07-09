<script lang="ts">
	import '../../css/notifications.css';

	import { Icon } from '@steeze-ui/svelte-icon';
	import { ExclamationCircle, InformationCircle, CheckCircle, X } from '@steeze-ui/heroicons';

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
	class="notification relative {type} mx-4 my-3 flex max-h-60 min-h-[7.5rem] w-80 flex-row rounded-lg border-l-8 bg-gradient-to-t from-[#1d2132] to-[#222b45] shadow-xl"
>
	<span
		on:click={() => removeNotification()}
		class="absolute top-0 right-0 m-2 rounded-full bg-white bg-opacity-5 hover:bg-opacity-20"
	>
		<Icon src={X} size="16" theme="solid" />
	</span>
	<div class="flex flex-row items-center justify-center px-4 py-4">
		<span class="mr-4"><Icon src={icon} size="28" theme="solid" /></span>
		<div class="inline max-h-full w-full overflow-auto align-middle font-bold">
			{#if heading}
				<header class="mb-1 text-xl font-bold text-white">{heading}</header>
			{/if}
			<p>{message}</p>
		</div>
	</div>
</div>
