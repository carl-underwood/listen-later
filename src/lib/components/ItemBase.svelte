<script lang="ts">
	import { loading } from '$lib/stores/loading';
	import { items } from '$lib/stores/items';
	import { formatDistanceToNow } from 'date-fns';
	import { Accordion, Switch } from '@skeletonlabs/skeleton-svelte';
	import TrashBin from './icons/trash-bin.svelte';
	import DeleteItemModal from './DeleteItemModal.svelte';
	import type Item from '$lib/types/Item';
	import type { Snippet } from 'svelte';

	let {
		item,
		itemLead,
		metadata,
		openButton
	}: {
		item: Item;
		itemLead: Snippet;
		metadata: Snippet;
		openButton: Snippet;
	} = $props();

	const onItemListenedChange = async (event: { checked: boolean }, item: Item) => {
		if ($loading) {
			return;
		}

		await loading.whileAwaiting(() =>
			items.upsertItem({
				...item,
				listened: event.checked
			})
		);
	};

	const deleteItem = (item: Item) => {};
	// 	const modalComponent: ModalComponent = {
	// 		ref: DeleteItemModal,
	// 		props: { item }
	// 	};

	// 	const modal: ModalSettings = {
	// 		type: 'component',
	// 		component: modalComponent
	// 	};

	// 	modalStore.trigger(modal);
	// };
</script>

<Accordion.Item value={item.id} disabled={$loading} controlClasses="focus:-outline-offset-4">
	{#snippet lead()}
		<div class="select-none">
			<div class="flex flex-col gap-4 shrink-0 justify-center items-center">
				{@render itemLead()}
			</div>
		</div>
	{/snippet}
	{#snippet control()}
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
	{#snippet panel()}
		<div class="flex flex-col gap-4 items-center">
			{@render openButton()}
			<Switch
				name={`listened-${item.id}`}
				onCheckedChange={(event) => onItemListenedChange(event, item)}
				checked={item.listened}
				disabled={$loading}
				classes="focus:outline-offset-4"
			>
				Listened
			</Switch>
			<small data-added-at-utc={item.addedAtUtc} class="text-center">
				Added {formatDistanceToNow(new Date(item.addedAtUtc), { addSuffix: true })}
				({new Date(item.addedAtUtc).toLocaleString()})
			</small>
			<button
				class="btn-icon btn-icon-sm preset-filled-error-500"
				disabled={$loading}
				onclick={() => deleteItem(item)}
			>
				<TrashBin classes="w-4 h-4" />
				<span class="sr-only">Delete {item.name}</span>
			</button>
		</div>
	{/snippet}
</Accordion.Item>
