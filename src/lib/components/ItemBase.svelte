<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { items } from '$lib/stores/items';
	import { loading } from '$lib/stores/loading';
	import { prefersReducedMotion } from '$lib/stores/prefersReducedMotion';
	import type Item from '$lib/types/Item';
	import {
		AccordionItem,
		getModalStore,
		SlideToggle,
		type ModalComponent,
		type ModalSettings
	} from '@skeletonlabs/skeleton';
	import { formatDistanceToNow } from 'date-fns';
	import type { Snippet } from 'svelte';
	import DeleteItemModal from './DeleteItemModal.svelte';
	import TrashBin from './icons/trash-bin.svelte';

	const modalStore = getModalStore();

	let {
		item,
		openAccordionItemId,
		itemLead,
		metadata,
		openButton
	}: {
		item: Item;
		openAccordionItemId: string | null;
		itemLead: Snippet;
		metadata: Snippet;
		openButton: Snippet;
	} = $props();

	const onItemListenedChange = async (event: Event, item: Item) => {
		if ($loading) {
			event.preventDefault();
			return;
		}

		await loading.whileAwaiting(() =>
			items.upsertItem({
				...item,
				listened: (event.target as HTMLInputElement).checked
			})
		);
	};

	const deleteItem = (item: Item) => {
		const modalComponent: ModalComponent = {
			ref: DeleteItemModal,
			props: { item }
		};

		const modal: ModalSettings = {
			type: 'component',
			component: modalComponent
		};

		modalStore.trigger(modal);
	};
</script>

<AccordionItem
	open={openAccordionItemId === item.id}
	duration={$prefersReducedMotion ? 0 : undefined}
	disabled={$loading}
	on:toggle={(event) => {
		// eslint-disable-next-line svelte/no-navigation-without-resolve
		goto(`${resolve('/list')}${event.detail.open ? `?itemId=${item.id}` : ''}`, {
			noScroll: true,
			replaceState: true,
			keepFocus: true
		});
	}}
	regionControl="focus:-outline-offset-4"
>
	{#snippet lead()}
		<div class="select-none">
			<div class="flex flex-col gap-4 shrink-0 justify-center items-center">
				{@render itemLead()}
			</div>
		</div>
	{/snippet}
	{#snippet summary()}
		<!-- Ignoring as the click event is only handled to prevent default -->
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			class="flex flex-col select-text"
			onclick={(event) => {
				if (getSelection()?.toString()) {
					event.preventDefault();
					event.stopImmediatePropagation();
					return;
				}
			}}
		>
			<span class="font-semibold">
				{item.name}
			</span>
			{@render metadata()}
		</div>
	{/snippet}
	{#snippet content()}
		<div class="flex flex-col gap-4 items-center">
			{@render openButton()}
			<SlideToggle
				name={`listened-${item.id}`}
				on:change={(event) => onItemListenedChange(event, item)}
				checked={item.listened}
				disabled={$loading}
				class="focus:outline-offset-4"
			>
				Listened
			</SlideToggle>
			<small data-added-at-utc={item.addedAtUtc} class="text-center">
				Added {formatDistanceToNow(new Date(item.addedAtUtc), { addSuffix: true })}
				({new Date(item.addedAtUtc).toLocaleString()})
			</small>
			<button
				class="btn-icon btn-icon-sm variant-filled-error"
				disabled={$loading}
				onclick={() => deleteItem(item)}
			>
				<TrashBin classes="w-4 h-4" />
				<span class="sr-only">Delete {item.name}</span>
			</button>
		</div>
	{/snippet}
</AccordionItem>
