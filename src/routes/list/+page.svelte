<script lang="ts">
	import { auth } from '$lib/stores/auth';
	import { user } from '$lib/stores/user';
</script>

{#if $user === undefined}
	Loading
{:else if $user}
	<h1>List</h1>
	<button on:click={auth.signOut}>Sign out</button>
{:else}
	<button on:click={auth.signInAnonymously}>Sign in anonymously</button>
{/if}
