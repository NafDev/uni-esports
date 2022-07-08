<!-- All pages should extend this layout to ensure SuperTokens is loaded -->
<script lang="ts" context="module">
	import type { AccessTokenPayload } from '@uni-esports/interfaces';
	import type { LoadEvent } from '@sveltejs/kit';

	import '../css/base.css';

	import SuperTokens from 'supertokens-website';
	import { fly } from 'svelte/transition';
	import { expoOut } from 'svelte/easing';
	import { browser, dev } from '$app/env';
	import { goto } from '$app/navigation';

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
				onHandleEvent: (event) => {
					switch (event.action) {
						case 'SIGN_OUT':
							user.set(undefined);
							break;
						case 'UNAUTHORISED':
							if (!window.location.toString().endsWith('/user/signin')) {
								pushNotification({
									message: 'Please sign in to continue',
									type: 'warning'
								});
								goto('/user/signin');
							}
							break;
						default:
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
	{#each $notificationStore as notif (notif.id)}
		<div in:fly={{ x: 1000, easing: expoOut }} out:fly={{ x: 500 }}>
			<Alert
				message={notif.message}
				type={notif.type}
				removeNotification={notif.removeNotification}
			/>
		</div>
	{/each}
</div>
