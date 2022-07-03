<!-- All pages should extend this layout to ensure SuperTokens is loaded -->
<script lang="ts" context="module">
	import '../css/base.css';

	import SuperTokens from 'supertokens-website';
	import type { LoadEvent } from '@sveltejs/kit';
	import { browser, dev } from '$app/env';
	import { goto } from '$app/navigation';

	import { BASE_API_URL } from '$lib/config';
	import { user } from '$lib/stores/auth.store';
	import type { AccessTokenPayload } from '@uni-esports/interfaces';

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
						case 'UNAUTHORISED':
							if (!window.location.toString().endsWith('/user/signin')) {
								goto('/');
							}
							break;
						default:
							break;
					}
				}
			});

			console.log('Initialised SuperTokens');

			try {
				const id = await SuperTokens.getUserId()
				const payload: AccessTokenPayload = await SuperTokens.getAccessTokenPayloadSecurely()
				user.set({...payload, id})
			} catch (error) {
				if (dev) {
					console.warn(error)
				}
			}
		}
		return {};
	}
</script>

<slot />
