<script lang="ts">
	import {
		Accordion,
		AccordionItem,
		type ModalComponent,
		type ModalSettings,
		modalStore
	} from '@skeletonlabs/skeleton';
	import { formatDistanceToNow } from 'date-fns';
	import { items } from '$lib/stores/items';
	import Loading from '$lib/components/Loading.svelte';
	import Plus from '$lib/components/icons/plus.svelte';
	import TrashBin from '$lib/components/icons/trash-bin.svelte';
	import DeleteModal from '$lib/components/DeleteModal.svelte';
	import type Item from '$lib/types/Item';

	const deleteItem = (item: Item) => {
		const modalComponent: ModalComponent = {
			ref: DeleteModal,
			props: { item }
		};

		const modal: ModalSettings = {
			type: 'component',
			component: modalComponent
		};

		modalStore.trigger(modal);
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
						{item.name}
					</svelte:fragment>
					<svelte:fragment slot="content">
						<span data-added-at-utc={item.addedAtUtc}>
							Added {formatDistanceToNow(new Date(item.addedAtUtc), { addSuffix: true })}
							({new Date(item.addedAtUtc).toLocaleString()})
						</span>
						<button
							class="btn-icon btn-icon-sm variant-soft-error"
							on:click={() => deleteItem(item)}
						>
							<TrashBin classes="w-4 h-4" />
							<span class="sr-only">Delete {item.name}</span>
						</button>
					</svelte:fragment>
				</AccordionItem>
			{/each}
		</Accordion>
	{/if}
{/if}
