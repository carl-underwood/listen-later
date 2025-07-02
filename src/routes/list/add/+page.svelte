<script lang="ts">
	import { goto } from '$app/navigation';
	import fuzzysort from 'fuzzysort';
	import { items } from '$lib/stores/items';
	import { functions } from '$lib/stores/functions';
	import { loading } from '$lib/stores/loading';
	import { search } from '$lib/functions/search';
	import type SearchResult from '$lib/types/SearchResult';
	import type Item from '$lib/types/Item';
	import SearchLoop from '$lib/components/icons/search-loop.svelte';
	import Loading from '$lib/components/Loading.svelte';
	import Check from '$lib/components/icons/check.svelte';
	import { type ItemType, itemTypes } from '$lib/types/ItemType';
	import SpotifyLogo from '$lib/components/SpotifyLogo.svelte';
	import ItemImage from '$lib/components/ItemImage.svelte';

	const MINIMUM_SEARCH_QUERY_LENGTH = 3;

	$effect(() => {
		$functions;
	});
	$effect(() => {
		$items;
	});

	let searchResults: SearchResult[] = $state([]);
	let lastSearchQuery = $state('');
	let searchQuery = $state('');
	let searchErrored = $state(false);
	let searching = $state(false);
	let showSearchError = $state(false);
	let showAddError = $state(false);
	let selectedItemId = $state('');

	let itemTypeFilters: { [Property in ItemType]: boolean } = $state({
		album: false,
		artist: false,
		episode: false,
		podcast: false,
		song: false
	});

	let itemTypeFiltersClear = $derived(itemTypes.every((itemType) => !itemTypeFilters[itemType]));
	let itemTypeFiltersFriendlyDescription = $derived(() => {
		const commaSeparatedItemTypeFilters = itemTypes
			.filter((itemType) => itemTypeFilters[itemType])
			.join(', ');

		const lastCommaIndex = commaSeparatedItemTypeFilters.lastIndexOf(',');

		if (lastCommaIndex < 0) {
			return commaSeparatedItemTypeFilters;
		}

		const replacement = ' &';

		return (
			commaSeparatedItemTypeFilters.slice(0, lastCommaIndex) +
			replacement +
			commaSeparatedItemTypeFilters.slice(lastCommaIndex + 1)
		);
	});

	let fuzzysortedResults = $derived(
		[
			...fuzzysort.go(lastSearchQuery, searchResults, {
				key: 'name'
			})
		]
			.sort((a, b) => {
				if (a.score === b.score) {
					return b.obj.popularity - a.obj.popularity;
				}

				return a.score < b.score ? 1 : -1; // fuzzysort scores are negative
			})
			.map((keyResult) => keyResult.obj)
	);

	let filteredResults = $derived(
		[
			...fuzzysortedResults,
			...searchResults.filter(
				(result) =>
					!fuzzysortedResults.find((fuzzysortedResult) => fuzzysortedResult.id === result.id)
			)
		].filter((item) => itemTypeFilters[item.type] || itemTypeFiltersClear)
	);

	const filterItemTypes = (itemType: ItemType) => {
		itemTypeFilters = { ...itemTypeFilters, [itemType]: !itemTypeFilters[itemType] };
	};

	const clearItemTypeFilters = () => {
		itemTypeFilters = {
			album: false,
			artist: false,
			episode: false,
			podcast: false,
			song: false
		};
	};

	const onSearchInput = () => {
		if (searchQuery.length >= MINIMUM_SEARCH_QUERY_LENGTH) {
			showSearchError = false;
		}
	};

	const onSearchSubmit = async (event: Event) => {
		event.preventDefault();

		showSearchError = searchQuery.length < MINIMUM_SEARCH_QUERY_LENGTH;

		if (showSearchError) {
			return;
		}

		await loading.whileAwaiting(async () => {
			searchResults = [];
			lastSearchQuery = '';
			searchErrored = false;
			selectedItemId = '';
			searching = true;

			try {
				searchResults = await search(searchQuery);
				lastSearchQuery = searchQuery;
			} catch {
				searchErrored = true;
			}

			searching = false;
		});
	};

	const onSelectionSubmit = async () => {
		if (!selectedItemId) {
			showAddError = true;
			return;
		}

		const selectedItem = searchResults.find((item) => item.id == selectedItemId);

		if (!selectedItem) {
			return;
		}

		const item: Item = {
			addedAtUtc: new Date().toISOString(),
			id: `${selectedItem.service}:${selectedItem.id}`,
			listened: false,
			name: selectedItem.name,
			service: selectedItem.service,
			type: selectedItem.type,
			url: selectedItem.url
		};

		await loading.whileAwaiting(async () => {
			if ($items?.find((existingItem) => existingItem.id === item.id)) {
				return;
			}

			await items.upsertItem(item);
		});

		goToListPage(item.id);
	};

	const goToListPage = (itemId?: string) => goto(`/list${!itemId ? '' : `?itemId=${itemId}`}`);

	const onItemClick = (event: Event, itemId: string) => {
		if ($loading) {
			return;
		}

		event.preventDefault();

		selectedItemId = itemId;
	};
</script>

<div id="add-container" class="flex flex-col">
	<div class="sticky top-0 p-4 -mt-4 bg-surface-50-950">
		<form onsubmit={onSearchSubmit}>
			<label class="label">
				<span class="sr-only">Search</span>
				<div class="input-group flex bg-surface-50-950 !border-surface-950-50">
					<div class="relative grow text-surface-950-50 bg-surface-50-950 !px-0 min-w-0">
						<div class="absolute">
							<SearchLoop />
						</div>
						<input
							type="search"
							placeholder="Search..."
							bind:value={searchQuery}
							disabled={$loading}
							oninput={onSearchInput}
							class="pl-14 pr-4 !bg-surface-50-950 focus:!ring-4 focus:ring-inset focus:ring-surface-500 grow min-w-0"
						/>
					</div>
					<button
						class="bg-surface-950-50 text-surface-50-950 focus:-outline-offset-4"
						disabled={$loading}
					>
						Submit
					</button>
				</div>
			</label>
			<small
				role={showSearchError || showAddError ? 'alert' : ''}
				class="text-error-700-300 min-h-[1.5rem] block text-center"
			>
				{#if showSearchError}
					Please enter a search query of at least {MINIMUM_SEARCH_QUERY_LENGTH} characters
				{/if}
				{#if showAddError}
					Please search for and select an item to add
				{/if}
			</small>
			<div class="mb-4 flex flex-wrap gap-4 justify-center">
				<span class="sr-only">Filters</span>
				{#each itemTypes as itemType}
					<span
						class="chip pointer"
						class:preset-filled={itemTypeFilters[itemType]}
						class:preset-tonal={!itemTypeFilters[itemType]}
						onclick={() => filterItemTypes(itemType)}
						onkeypress={(event) => {
							if (event.key == ' ' || event.code == 'Space' || event.keyCode == 32) {
								filterItemTypes(itemType);
								event.preventDefault();
							}
						}}
						role="checkbox"
						aria-checked={itemTypeFilters[itemType]}
						tabindex="0"
					>
						{#if itemTypeFilters[itemType]}<span><Check classes="h-2.5 w-2.5" /></span>{/if}
						<span class="capitalize">{itemType + 's'}</span>
					</span>
				{/each}
				<button
					class="chip rounded-base"
					class:preset-tonal-error={itemTypeFiltersClear}
					class:preset-filled-error-500={!itemTypeFiltersClear}
					onclick={clearItemTypeFilters}
					type="button"
				>
					Clear <span class="sr-only">filters</span>
				</button>
			</div>
		</form>
	</div>

	<div aria-live="assertive">
		{#if searching}
			<Loading />
		{:else if !filteredResults.length}
			<div class="m-4 text-center">
				{#if searchErrored}
					<span role="alert" class="text-error-700-300">
						There was an error when fetching search results, please try again
					</span>
				{:else if lastSearchQuery}
					<span>Nothing found</span>
					<span>
						Please try {searchResults.length
							? 'adjusting the filters'
							: 'searching for something else'}.
					</span>
				{:else}
					<span>Search for something above 👆</span>
				{/if}
			</div>
		{:else}
			<span class="sr-only">
				Showing {itemTypeFiltersClear ? 'all' : itemTypeFiltersFriendlyDescription()}
				search results.
			</span>
			<div>
				{#each filteredResults as item, i (item.id)}
					<div
						tabindex="0"
						role="option"
						aria-selected={selectedItemId === item.id}
						class="p-4 focus:!-outline-offset-4"
						onclick={(event) => onItemClick(event, item.id)}
						onkeyup={(event) => {
							if (event.key !== 'space') {
								return;
							}
							onItemClick(event, item.id);
						}}
					>
						<div id={item.id} class="flex gap-4 items-center" class:cursor-not-allowed={$loading}>
							<div class="flex flex-col gap-4 shrink-0 justify-center items-center">
								<ItemImage itemMetadata={item} />
								<SpotifyLogo classes="w-20" />
							</div>
							<div class="flex flex-col">
								<span class="font-semibold">
									{item.name}
								</span>
								{#each item.metadataParts as metadataPart}
									<span class="break-word">{metadataPart}</span>
								{/each}
							</div>
						</div>
					</div>
					{#if i !== filteredResults.length - 1}
						<hr class="!border-t-4" />
					{/if}
				{/each}
			</div>
		{/if}
	</div>
</div>

<div class="sticky bottom-0 -mb-4 p-4 flex justify-center gap-4 bg-surface-50-950">
	<button
		class="btn bg-surface-950-50 text-surface-50-950"
		type="submit"
		disabled={$loading}
		onclick={onSelectionSubmit}
	>
		Add
	</button>
	<button class="btn preset-tonal" type="button" disabled={$loading} onclick={() => goToListPage()}>
		Cancel
	</button>
</div>

<style>
	#add-container {
		min-height: calc(
			100vh - (4.6875rem + 1rem + 3.625rem)
		); /* Top bar + bottom padding + add and cancel buttons */
		min-height: calc(
			100svh - (4.6875rem + 1rem + 3.625rem)
		); /* Top bar + bottom padding + add and cancel buttons */
	}
</style>
