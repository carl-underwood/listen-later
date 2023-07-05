<script lang="ts">
	import { auth } from '$lib/stores/auth';
	import { user } from '$lib/stores/user';
	import { loading } from '$lib/stores/loading';
</script>

{#if $user === undefined}
	Loading
{:else if $user === null}
	<button
		on:click={() => loading.whileAwaiting(auth.signInAnonymously)}
		disabled={$loading}
		class="btn bg-gradient-to-br variant-gradient-secondary-tertiary"
	>
		Sign in anonymously
	</button>
{:else}
	<h1>List</h1>
{/if}
