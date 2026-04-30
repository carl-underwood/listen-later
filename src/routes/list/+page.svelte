<script lang="ts">
	import { slide } from 'svelte/transition';
	import { page } from '$app/state';
	import { Accordion, getDrawerStore } from '@skeletonlabs/skeleton';
	import smoothScrollIntoViewIfNeeded from 'smooth-scroll-into-view-if-needed';
	import { items } from '$lib/stores/items';
	import { filter } from '$lib/stores/filter';
	import { loading } from '$lib/stores/loading';
	import { prefersReducedMotion } from '$lib/stores/prefersReducedMotion';
	import Loading from '$lib/components/Loading.svelte';
	import PlusIcon from '$lib/components/icons/plus.svelte';
	import preventDefaultIf from '$lib/helpers/preventDefaultIf';
	import ItemSpotify from '$lib/components/ItemSpotify.svelte';
	import { user } from '$lib/stores/user';
	import PromoteAccountAlert from '$lib/components/PromoteAccountAlert.svelte';
	import { resolve } from '$app/paths';
	import SortIcon from '$lib/components/icons/sort.svelte';
	import FilterIcon from '$lib/components/icons/filter.svelte';
	import FilterOutlineIcon from '$lib/components/icons/filter-outline.svelte';
	import { drawerIds } from '$lib/types/Drawers';
	import { goto } from '$app/navigation';

	const drawerStore = getDrawerStore();

	let accordionItems: { [Property: string]: HTMLDivElement } = $state({});
	let openAccordionItemId = $derived(page.url.searchParams.get('itemId'));
	let currentItemFilteredOut = $derived(
		openAccordionItemId &&
			$items &&
			$items.allItems.find((i) => i.id === openAccordionItemId) &&
			!$items.filteredAndSortedItems.find((i) => i.id === openAccordionItemId)
	);
	let allItemsFilteredOut = $derived(
		$items && $items.allItems.length > 0 && !$items.filteredAndSortedItems.length
	);

	$effect(() => {
		if (openAccordionItemId && accordionItems[openAccordionItemId]) {
			smoothScrollIntoViewIfNeeded(accordionItems[openAccordionItemId], {
				behavior: 'smooth',
				duration: $prefersReducedMotion ? 0 : 800
			});
		}
	});

	const slideWithPrefersReducedMotion = (node: Element) =>
		slide(node, { duration: $prefersReducedMotion ? 0 : undefined });
</script>

{#if $items === undefined}
	<Loading />
{:else}
	<div id="list-container" class="flex flex-col gap-4">
		<h1 class="sr-only">List</h1>
		{#if !$items.allItems.length}
			<span class="block text-center mx-4" transition:slideWithPrefersReducedMotion>
				Nothing here yet! Use the button below to add an item 👇
			</span>
		{:else if $user?.isAnonymous}
			<PromoteAccountAlert>
				{#snippet signInButton()}
					<!-- eslint-disable svelte/no-navigation-without-resolve -->
					<a
						href={`${resolve('/list/settings')}?promoteAccount=true`}
						class="btn bg-surface-900-50-token text-surface-50-900-token"
					>
						Sign in
					</a>
					<!-- eslint-enable svelte/no-navigation-without-resolve -->
				{/snippet}
			</PromoteAccountAlert>
		{/if}
		<Accordion disabled={$loading} spacing="" padding="p-4">
			{#each $items.filteredAndSortedItems as item (item.id)}
				<div
					bind:this={accordionItems[item.id]}
					transition:slideWithPrefersReducedMotion
					class="ring-4 ring-surface-900-50-token mt-1"
				>
					{#if item.service === 'spotify'}
						<ItemSpotify {item} {openAccordionItemId} />
					{/if}
				</div>
			{/each}
		</Accordion>
	</div>
	{#if allItemsFilteredOut || currentItemFilteredOut}
		<div
			id="filter-alert"
			role="alert"
			class="alert variant-filled-warning ring-4 ring-surface-900-50-token sticky mt-6"
			transition:slideWithPrefersReducedMotion
		>
			<div class="alert-message">
				{#if allItemsFilteredOut}
					<p>No items match your current filters.</p>
				{:else if currentItemFilteredOut}
					<p>The selected item is currently hidden by your filters.</p>
				{/if}
			</div>
			<div class="alert-actions">
				<button
					class="btn bg-surface-900-50-token text-surface-50-900-token"
					onclick={() => filter.reset()}
				>
					Clear filters
				</button>
				{#if currentItemFilteredOut}
					<button
						class="btn !bg-transparrent"
						onclick={() => {
							// eslint-disable-next-line svelte/no-navigation-without-resolve
							goto(resolve('/list'), {
								replaceState: true,
								noScroll: true
							});
						}}
					>
						Dismiss
					</button>
				{/if}
			</div>
		</div>
	{/if}
	<div class="mt-5 sticky bottom-4 left-1/2 -translate-x-1/2 w-max flex gap-2">
		<button
			type="button"
			class="btn bg-surface-900-50-token text-surface-50-900-token w-16"
			class:opacity-50={$loading}
			class:cursor-not-allowed={$loading}
			onclick={(event) => {
				preventDefaultIf(event, $loading);
				if (!$loading)
					drawerStore.open({ id: drawerIds.sort, position: 'bottom', regionDrawer: 'max-w-100' });
			}}
		>
			<SortIcon />
			<span class="sr-only">Sort items</span>
		</button>
		<a
			href={resolve('/list/add')}
			class="btn bg-surface-900-50-token text-surface-50-900-token w-36"
			class:opacity-50={$loading}
			class:cursor-not-allowed={$loading}
			onclick={(event) => preventDefaultIf(event, $loading)}
		>
			<PlusIcon />
			<span class="sr-only">Add item</span>
		</a>
		<button
			type="button"
			class="btn bg-surface-900-50-token text-surface-50-900-token w-16"
			class:opacity-50={$loading}
			class:cursor-not-allowed={$loading}
			onclick={(event) => {
				preventDefaultIf(event, $loading);
				if (!$loading)
					drawerStore.open({
						id: drawerIds.filter,
						position: 'bottom',
						regionDrawer: 'max-w-100'
					});
			}}
		>
			{#if filter.isFiltering($filter)}
				<FilterIcon />
			{:else}
				<FilterOutlineIcon />
			{/if}
			<span class="sr-only">Filter items</span>
		</button>
	</div>
{/if}

<style>
	#list-container {
		min-height: calc(
			100vh - (4.6875rem + 1rem + 3.875rem)
		); /* Top bar + bottom padding + add button */
		min-height: calc(
			100svh - (4.6875rem + 1rem + 3.875rem)
		); /* Top bar + bottom padding + add button */
	}

	#filter-alert {
		bottom: calc(1rem + 3.875rem);
	}
</style>
