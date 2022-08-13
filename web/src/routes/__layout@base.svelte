<script>
	import Sidebar from '$components/base/sidebar/index.svelte';
	import Header from '$components/base/header.svelte';

	let mobileSidebarActive = false;
</script>

<div class="grid h-screen w-screen grid-flow-col grid-cols-[300px_1fr]">
	<!-- Sidebar -->
	<div
		class="absolute z-40 h-screen w-[300px] lg:static lg:inline"
		class:hidden={!mobileSidebarActive}
	>
		<Sidebar bind:mobileSidebarActive />
	</div>

	<!-- Sidebar dark backdrop (mobile) -->
	<div
		class="absolute z-30 h-full w-full bg-black bg-opacity-50 lg:hidden"
		class:hidden={!mobileSidebarActive}
		on:click={() => (mobileSidebarActive = false)}
	/>

	<div class="col-span-2 flex h-full w-full flex-col overflow-y-auto px-12 lg:col-span-2">
		<!-- Hamburger menu & profile menu -->
		<Header bind:mobileSidebarActive />

		<!-- Main Page Content -->
		<div class="w-full max-w-screen-xl self-center">
			<slot />
		</div>
	</div>
</div>
