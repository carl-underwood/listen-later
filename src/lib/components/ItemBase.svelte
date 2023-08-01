<script lang="ts">
	import { goto } from '$app/navigation';
	import { loading } from '$lib/stores/loading';
	import { items } from '$lib/stores/items';
	import { formatDistanceToNow } from 'date-fns';
	import { prefersReducedMotion } from '$lib/stores/prefersReducedMotion';
	import {
		AccordionItem,
		SlideToggle,
		type ModalComponent,
		type ModalSettings,
		modalStore
	} from '@skeletonlabs/skeleton';
	import TrashBin from './icons/trash-bin.svelte';
	import DeleteItemModal from './DeleteItemModal.svelte';
	import type Item from '$lib/types/Item';

	export let item: Item;
	export let openAccordionItemId: string | null;

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
		goto(`/list${event.detail.open ? `?itemId=${item.id}` : ''}`, {
			noScroll: true,
			replaceState: true,
			keepFocus: true
		});
	}}
	regionControl="focus:-outline-offset-4"
>
	<div slot="lead" class="select-none">
		<div class="flex flex-col gap-4 shrink-0 justify-center items-center">
			<slot name="lead" />
		</div>
	</div>
	<!-- Ignoring as the click event is only handled to prevent default -->
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<div
		slot="summary"
		class="flex flex-col select-text"
		on:click={(event) => {
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
		<slot name="metadata" />
	</div>
	<div slot="content" class="flex flex-col gap-4 items-center">
		<slot name="openButton" />
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
			on:click={() => deleteItem(item)}
		>
			<TrashBin classes="w-4 h-4" />
			<span class="sr-only">Delete {item.name}</span>
		</button>
	</div>
</AccordionItem>
