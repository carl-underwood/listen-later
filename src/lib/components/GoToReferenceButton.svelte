<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	export let oneBasedReferenceNumber: number;
</script>

<button class="underline" on:click={() => dispatch('goToReference', { oneBasedReferenceNumber })}>
	[<span class="sr-only">see reference </span>{oneBasedReferenceNumber}]
</button>
