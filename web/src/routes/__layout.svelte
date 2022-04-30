<script context="module" lang="ts">
  import { browser,dev } from '$app/env';
  import { testStore } from '@/lib/stores/test.store';
  import SuperTokens from 'supertokens-website';
  import '../app.css';
  import { authUser,getActiveUser } from '../lib/stores/auth.store';

  if (browser) {
    console.log('INITIALISING SUPERTOKENS-WEB');

    SuperTokens.init({
      apiDomain: dev ? 'http://localhost:8080' : '',
      autoAddCredentials: true
    });

    getActiveUser().then((result) => authUser.set(result));
  }
</script>

<h1>{$testStore}</h1>
<slot />

<a href="/">Go to Home</a>
<a href="/template">Go to Template</a>
<svelte:head>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" />
  <link href="https://fonts.googleapis.com/css2?family=Play&display=swap" rel="stylesheet" />
</svelte:head>
