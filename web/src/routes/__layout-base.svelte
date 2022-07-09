<!-- All pages should extend this layout to ensure SuperTokens is loaded -->
<script lang="ts" context="module">
	import type { AccessTokenPayload } from '@uni-esports/interfaces';
	import type { LoadEvent } from '@sveltejs/kit';

	import '../css/base.css';

	import SuperTokens from 'supertokens-website';
	import { fly } from 'svelte/transition';
	import { expoOut } from 'svelte/easing';
	import { browser, dev } from '$app/env';

	import Alert from '$components/base/alert.svelte';

	import { BASE_API_URL } from '$lib/config';
	import { user } from '$lib/stores/auth.store';
	import { notificationStore, pushNotification } from '$lib/stores/notifications.store';

	export async function load({}: LoadEvent) {
		if (browser) {
			SuperTokens.init({
				apiDomain: BASE_API_URL,
				apiBasePath: '/',
				autoAddCredentials: true,
				onHandleEvent: async (event) => {
					switch (event.action) {
						case 'SESSION_CREATED':
							console.log('Session Created');
						case 'REFRESH_SESSION':
							console.log('Session Refreshed');
							const userId = await SuperTokens.getUserId();
							const tokenPayload: AccessTokenPayload =
								await SuperTokens.getAccessTokenPayloadSecurely();
							user.set({ id: userId, ...tokenPayload });
							break;
						case 'SIGN_OUT':
							user.set(undefined);
							break;
					}
				}
			});

			try {
				const id = await SuperTokens.getUserId();
				const payload: AccessTokenPayload = await SuperTokens.getAccessTokenPayloadSecurely();
				user.set({ ...payload, id });
			} catch (error) {
				if (dev) {
					console.warn(error);
				}
			}
		}
		return {};
	}
</script>

<slot />

<!-- Notifications -->
<div class="absolute bottom-0 right-0 z-50 flex flex-col items-end justify-end overflow-clip">
	{#each $notificationStore as n (n.id)}
		<div in:fly={{ x: 1000, easing: expoOut }} out:fly={{ x: 500 }}>
			<Alert
				message={n.message}
				type={n.type}
				heading={n.heading}
				removeNotification={n.removeNotification}
			/>
		</div>
	{/each}
</div>
