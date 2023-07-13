<script lang="ts">
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
	import smoothScrollIntoViewIfNeeded from 'smooth-scroll-into-view-if-needed';
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

	let accordionItems: { [Property: string]: HTMLDivElement } = {};
	$: openAccordionItemId = $page.url.searchParams.get('itemId');

	$: if (openAccordionItemId && accordionItems[openAccordionItemId]) {
		smoothScrollIntoViewIfNeeded(accordionItems[openAccordionItemId], {
			behavior: 'smooth',
			duration: 800
		});
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
		href="/list/add"
		class="btn bg-surface-900-50-token text-surface-50-900-token sticky top-4 left-1/2 -translate-x-1/2 w-36"
		class:opacity-50={$loading}
		class:cursor-not-allowed={$loading}
		on:click={preventDefaultIfLoading}
	>
		<Plus />
		<span class="sr-only">Add item</span>
	</a>
	<div class="my-4">
		{#if !$items.length}
			<span
				class="block text-center mx-4"
				transition:slide={{ duration: $prefersReducedMotion ? 0 : undefined }}
			>
				Nothing here yet! Use the button above to add an item 👆
			</span>
		{/if}
		<Accordion disabled={$loading} spacing="" padding="p-4">
			{#each $items as item (item.id)}
				<div
					bind:this={accordionItems[item.id]}
					transition:slide={{ duration: $prefersReducedMotion ? 0 : undefined }}
					class="border-surface-900-50-token ring-4 ring-surface-900-50-token mt-1 first:mt-0"
				>
					<AccordionItem
						open={openAccordionItemId === item.id}
						duration={$prefersReducedMotion ? 0 : undefined}
						disabled={$loading}
						on:toggle={(event) =>
							goto(`/list${event.detail.open ? `?itemId=${item.id}` : ''}`, {
								noScroll: true,
								replaceState: true,
								keepFocus: true
							})}
						regionControl="focus:-outline-offset-4"
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
								class:opacity-50={$loading}
								class:cursor-not-allowed={$loading}
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
				</div>
			{/each}
		</Accordion>
	</div>
{/if}
