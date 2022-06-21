<script>
	import { goto } from '$app/navigation';
	import { authUser, isAuthed } from '$lib/stores/auth.store';
</script>

<p><b>Login Status: </b>{$isAuthed}</p>
{#if $isAuthed}
	<button on:click={() => authUser.set(undefined)}>Log out</button>
	<a href="/protected">Go to protected page</a>
{:else}
	<button on:click={() => goto('/login')}>Log in</button>
{/if}
