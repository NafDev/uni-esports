<!-- All pages should extend this layout to ensure SuperTokens is loaded -->
<script lang="ts" context="module">
	import '../css/base.css';

	import SuperTokens from 'supertokens-website';
	import type { LoadEvent } from '@sveltejs/kit';
	import { browser } from '$app/env';

	import { BASE_API_URL } from '$lib/config';

	export async function load({}: LoadEvent) {
		if (browser) {
			SuperTokens.init({
				apiDomain: BASE_API_URL,
				apiBasePath: '/',
				autoAddCredentials: true
			});
			console.log('Initialised SuperTokens');
		}
		return {};
	}
</script>

<slot />
