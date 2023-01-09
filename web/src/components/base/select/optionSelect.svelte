<script lang="ts">
	import { ChevronDown, XMark } from '@steeze-ui/heroicons';
	import { Icon } from '@steeze-ui/svelte-icon';
	import Select from 'svelte-select';

	export let selectedValue: { value: string | number; label: string };
	export let options: Array<{ value: string | number; label: string }>;
</script>

<div class="border-b-2 border-white border-opacity-50">
	<Select
		--font-size="14px"
		--background="#2A364B"
		--border-radius="2px"
		--border="0"
		--border-hover="0"
		--border-focused="0"
		--chevron-color="#ADB1B8"
		--item-color="#F0F4F5"
		--list-background="#2A364B"
		--item-hover-bg="#131E2B"
		--item-is-active-colour="#3372DF"
		--input-padding="0rem"
		--selected-item-padding="0rem"
		bind:value={selectedValue}
		showChevron={true}
		items={options}
	>
		<div slot="chevron-icon"><Icon src={ChevronDown} theme="mini" size="18" /></div>
		<div slot="clear-icon"><Icon src={XMark} theme="mini" size="18" /></div>
	</Select>
</div>
