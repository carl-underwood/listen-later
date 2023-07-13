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
		modalStore,
		SlideToggle
	} from '@skeletonlabs/skeleton';
	import { formatDistanceToNow } from 'date-fns';
	import { items } from '$lib/stores/items';
	import { loading } from '$lib/stores/loading';
	import { prefersReducedMotion } from '$lib/stores/prefersReducedMotion';
	import Loading from '$lib/components/Loading.svelte';
	import Plus from '$lib/components/icons/plus.svelte';
	import TrashBin from '$lib/components/icons/trash-bin.svelte';
	import Headphone from '$lib/components/icons/headphone.svelte';
	import SpotifyIcon from '$lib/components/SpotifyIcon.svelte';
	import DeleteModal from '$lib/components/DeleteModal.svelte';
	import type Item from '$lib/types/Item';

	let goToItem: string | null = null;

	onMount(() => {
		const goToItem = $page.url.searchParams.get('item');

		if (!goToItem) {
			return;
		}

		openAccordionItemId = goToItem;
		goto('/list', { replaceState: true });
	});

	let accordionItems: { [Property: string]: HTMLDivElement } = {};
	let openAccordionItemId: string | undefined = undefined;

	$: if (goToItem && accordionItems[goToItem]) {
		accordionItems[goToItem].scrollIntoView({ behavior: 'smooth' });
		goToItem = null;
	}

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
			ref: DeleteModal,
			props: { item }
		};

		const modal: ModalSettings = {
			type: 'component',
			component: modalComponent
		};

		modalStore.trigger(modal);
	};

	const preventDefaultIfLoading = (event: Event) => {
		if ($loading) {
			event.preventDefault();
		}
	};
</script>

{#if $items === undefined}
	<Loading />
{:else}
	<h1 class="sr-only">List</h1>
	<a
		class="btn bg-gradient-to-br variant-gradient-secondary-tertiary sticky top-4 left-1/2 -translate-x-1/2 w-36"
		href="/list/add"
		on:click={preventDefaultIfLoading}
	>
		<Plus />
		<span class="sr-only">Add item</span>
	</a>
	<div class="my-4 max-w-2xl mx-auto">
		{#if !$items.length}
			<span
				class="block text-center mx-4"
				transition:slide={{ duration: $prefersReducedMotion ? 0 : undefined }}
			>
				Nothing here yet! Use the button above to add an item 👆
			</span>
		{/if}
		<Accordion disabled={$loading} padding="p-4">
			{#each $items as item (item.id)}
				<div
					bind:this={accordionItems[item.id]}
					transition:slide={{ duration: $prefersReducedMotion ? 0 : undefined }}
				>
					<AccordionItem
						open={openAccordionItemId === item.id}
						duration={$prefersReducedMotion ? 0 : undefined}
						disabled={$loading}
						on:toggle={(event) => {
							if (event.detail.open) {
								openAccordionItemId = item.id;
							}
						}}
					>
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
						<div slot="content" class="flex flex-col gap-4 items-center">
							<a
								href={item.spotifyUrl + '?go=1'}
								target="_blank"
								class="btn bg-[#1DB954] font-semibold text-white rounded-3xl"
								on:click={preventDefaultIfLoading}
							>
								<SpotifyIcon classes="w-6 h-6 mr-3 fill-white" />
								Open in Spotify
							</a>
							<SlideToggle
								name={`listened-${item.id}`}
								on:change={(event) => onItemListenedChange(event, item)}
								checked={item.listened}
								disabled={$loading}
							>
								Listened
							</SlideToggle>
							<small data-added-at-utc={item.addedAtUtc} class="text-center">
								Added {formatDistanceToNow(new Date(item.addedAtUtc), { addSuffix: true })}
								({new Date(item.addedAtUtc).toLocaleString()})
							</small>
							<button
								class="btn-icon btn-icon-sm variant-soft-error"
								disabled={$loading}
								on:click={() => deleteItem(item)}
							>
								<TrashBin classes="w-4 h-4" />
								<span class="sr-only">Delete {item.name}</span>
							</button>
						</div>
					</AccordionItem>
				</div>
			{/each}
		</Accordion>
	</div>
{/if}
