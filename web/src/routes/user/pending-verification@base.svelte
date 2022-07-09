<script lang="ts" context="module">
	import type { LoadEvent } from '@sveltejs/kit';

	export async function load(input: LoadEvent) {
		console.log(input.session)
		if (!input.session.user || !input.session.user.pendingEmailVerification) {
			return {
				status: 302,
				redirect: '/user/signin'
			};
		}
		return {};
	}
</script>

<script lang="ts">
	import { browser } from '$app/env';
	import { goto } from '$app/navigation';
	import { user } from '$lib/stores/auth.store';

	import { Icon } from '@steeze-ui/svelte-icon';
	import { InboxIn } from '@steeze-ui/heroicons';
	import { resendVerificationEmail } from '$lib/api/auth';
	import { pushNotification } from '$lib/stores/notifications.store';

	if (browser && !user.get().pendingEmailVerification) {
		goto('/');
	}

	let isLoading = false;
	let canResend = true;

	async function resendEmail() {
		if (canResend) {
			isLoading = true;
			await resendVerificationEmail();
			isLoading = false;

			canResend = false;
			setTimeout(() => (canResend = true), 1000 * 60 * 5);
		} else {
			pushNotification({
				message:
					'A new email has already been sent to you. Please wait a few minutes for it to arrive, and check your spam/junk folder.',
				type: 'warning'
			});
		}
	}
</script>

<div class="m-auto w-5/6 md:w-96">
	<div class="my-10 flex flex-col">
		<h1 class="flex flex-col justify-center text-center align-middle text-3xl font-bold">
			<span><Icon class="mb-2 inline" src={InboxIn} size="36" /></span>
			Verify your email address
		</h1>

		<p class="my-10 text-center">Check your inbox for an email verification link</p>

		<button 
			class="btn primary self-center" 
			class:isLoading disabled={isLoading} 
			on:click={() => resendEmail()}
		>
			Resend email
		</button>
	</div>
</div>
