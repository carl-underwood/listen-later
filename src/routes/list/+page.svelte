<script lang="ts">
	import { items } from '$lib/stores/items';
	import Loading from '$lib/components/Loading.svelte';
	import Plus from '$lib/components/icons/plus.svelte';
</script>

{#if $items === undefined}
	<Loading />
{:else}
	<h1 class="sr-only">List</h1>
	<a
		class="btn bg-gradient-to-br variant-gradient-secondary-tertiary sticky top-0 left-1/2 -translate-x-1/2 w-36"
		href="/list/add"
	>
		<Plus />
		<span class="sr-only">Add item</span>
	</a>
	{#if !$items.length}
		Nothing here yet
	{:else}
		{#each $items as item (item.id)}
			{item.id}
		{/each}
	{/if}
{/if}
