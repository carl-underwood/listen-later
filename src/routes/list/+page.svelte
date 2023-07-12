<script lang="ts">
	import { onMount } from 'svelte';
	import { slide } from 'svelte/transition';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
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
	import Headphone from '$lib/components/icons/headphone.svelte';
	import DeleteModal from '$lib/components/DeleteModal.svelte';
	import type Item from '$lib/types/Item';
	import { prefersReducedMotion } from '$lib/stores/prefersReducedMotion';

	let goToItem: string | null = null;

	onMount(() => {
		goToItem = $page.url.searchParams.get('item');

		if (goToItem) {
			goto('/list', { replaceState: true });
		}
	});

	let accordionItems: { [Property: string]: HTMLDivElement } = {};

	$: if (goToItem && accordionItems[goToItem]) {
		accordionItems[goToItem].scrollIntoView({ behavior: 'smooth' });
	}

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
	{/if}
	<Accordion>
		{#each $items as item (item.id)}
			<div
				bind:this={accordionItems[item.id]}
				transition:slide={{ duration: $prefersReducedMotion ? 0 : undefined }}
			>
				<AccordionItem open={goToItem === item.id} duration={$prefersReducedMotion ? 0 : undefined}>
					<svelte:fragment slot="lead">
						<div class="flex flex-col gap-2 shrink-0 justify-center items-center">
							{#if item.imageUrl}
								<img class="h-16 w-16" src={item.imageUrl} alt="" loading="lazy" />
							{:else}
								<div class="h-16 w-16 bg-surface-500 flex justify-center items-center">
									<Headphone classes="h-6 w-6 text-white" />
								</div>
							{/if}
						</div>
					</svelte:fragment>
					<div slot="summary" class="flex flex-col">
						<span class="font-semibold">
							{item.name}
						</span>
						{#each item.metadata as metadataPart}
							<span>{metadataPart}</span>
						{/each}
					</div>
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
			</div>
		{/each}
	</Accordion>
{/if}
