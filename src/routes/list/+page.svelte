<script lang="ts">
	import { auth } from '$lib/stores/auth';
	import { user } from '$lib/stores/user';
	import { loading } from '$lib/stores/loading';
	import { ProgressRadial } from '@skeletonlabs/skeleton';
	import Plus from '$lib/components/icons/plus.svelte';
</script>

<div aria-live="polite">
	{#if $user === null}
		<button
			on:click={() => loading.whileAwaiting(auth.signInAnonymously)}
			disabled={$loading}
			class="btn bg-gradient-to-br variant-gradient-secondary-tertiary"
		>
			Sign in anonymously
		</button>
	{:else if $user === undefined}
		<!-- || $items === undefined} -->
		<ProgressRadial />
		<span class="sr-only">Loading</span>
	{:else}
		<h1 class="sr-only">List</h1>
		<a
			class="btn bg-gradient-to-br variant-gradient-secondary-tertiary sticky top-0 left-1/2 -translate-x-1/2 w-36"
			href="/list/add"
		>
			<Plus />
			<span class="sr-only">Add item</span>
		</a>
	{/if}
</div>
