<script lang="ts">
	import { items } from '$lib/stores/items';
	import Loading from '$lib/components/Loading.svelte';
	import Plus from '$lib/components/icons/plus.svelte';
	import { Accordion, AccordionItem } from '@skeletonlabs/skeleton';
	import TrashBin from '$lib/components/icons/trash-bin.svelte';
	import { loading } from '$lib/stores/loading';

	const deleteItem = async (itemId: string) => {
		await loading.whileAwaiting(() => items.deleteItem(itemId));
	};
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
		<Accordion>
			{#each $items as item (item.id)}
				<AccordionItem>
					<svelte:fragment slot="summary">
						{item.id}
					</svelte:fragment>
					<svelte:fragment slot="content">
						<button
							class="btn-icon btn-icon-sm variant-soft-error"
							disabled={$loading}
							on:click={() => deleteItem(item.id)}
						>
							<TrashBin classes="w-4 h-4" />
							<span class="sr-only">Delete {item.id}</span>
						</button>
					</svelte:fragment>
				</AccordionItem>
			{/each}
		</Accordion>
	{/if}
{/if}
