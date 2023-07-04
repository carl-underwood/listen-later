<script lang="ts">
	import { auth } from '$lib/stores/auth';
	import { user } from '$lib/stores/user';

	let loading = false;

	const withLoading = async (action: () => Promise<unknown>) => {
		loading = true;
		await action();
		loading = false;
	};
</script>

{#if $user === undefined}
	Loading
{:else if $user}
	<h1>List</h1>
	<button
		on:click={() => withLoading(auth.signOut)}
		disabled={loading}
		class="btn bg-gradient-to-br variant-gradient-secondary-tertiary">Sign out</button
	>
{:else}
	<button
		on:click={() => withLoading(auth.signInAnonymously)}
		disabled={loading}
		class="btn bg-gradient-to-br variant-gradient-secondary-tertiary"
	>
		Sign in anonymously
	</button>
{/if}
