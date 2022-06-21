<script lang="ts">
	export let type = 'text';
	export let name: string;
	export let label: string;
	export let required = false;

	export let value: string | undefined = undefined;

	const setType = (node: HTMLInputElement) => {
		node.type = type;
	};
</script>

<div class="relative z-0 mb-6 w-full floating-field">
	<input
		use:setType
		{name}
		class="block py-2.5 px-0 w-full text-sm text-white bg-transparent border-0 border-b-2 border-grey appearance-none focus:outline-none focus:ring-0 focus:border-primary peer"
		placeholder=" "
		{required}
		bind:value
	/>
	<label
		for={name}
		class="absolute text-sm text-white text-opacity-80 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-primary peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
		>{label}</label
	>
</div>
