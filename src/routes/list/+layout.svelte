<script lang="ts">
	import { auth } from '$lib/stores/auth';
	import { user } from '$lib/stores/user';
	import { loading } from '$lib/stores/loading';
	import Loading from '$lib/components/Loading.svelte';
</script>

<div aria-live="polite">
	{#if $user === undefined}
		<Loading />
	{:else if $user === null}
		<button
			on:click={() => loading.whileAwaiting(auth.signInAnonymously)}
			disabled={$loading}
			class="btn bg-gradient-to-br variant-gradient-secondary-tertiary"
		>
			Sign in anonymously
		</button>
	{:else}
		<slot />
	{/if}
</div>
