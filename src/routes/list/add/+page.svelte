<script lang="ts">
	import { goto } from '$app/navigation';
	import fuzzysort from 'fuzzysort';
	import { items } from '$lib/stores/items';
	import { functions } from '$lib/stores/functions';
	import { loading } from '$lib/stores/loading';
	import { search } from '$lib/functions/search';
	import type SearchResult from '$lib/types/SearchResult';
	import type Item from '$lib/types/Item';
	import { ListBox, ListBoxItem } from '@skeletonlabs/skeleton';
	import SearchLoop from '$lib/components/icons/search-loop.svelte';
	import Loading from '$lib/components/Loading.svelte';
	import Check from '$lib/components/icons/check.svelte';
	import type ItemType from '$lib/types/ItemType';
	import { itemTypes } from '$lib/types/ItemType';
	import SpotifyLogo from '$lib/components/SpotifyLogo.svelte';
	import ItemImage from '$lib/components/ItemImage.svelte';

	const MINIMUM_SEARCH_QUERY_LENGTH = 3;

	$: $functions;
	$: $items;

	let searchResults: SearchResult[] = [];
	let lastSearchQuery = '';
	let searchQuery = '';
	let searchErrored = false;
	let searching = false;
	let showSearchError = false;
	let showAddError = false;
	let selectedItemId = '';

	let itemTypeFilters: { [Property in ItemType]: boolean } = {
		album: false,
		artist: false,
		episode: false,
		podcast: false,
		song: false
	};

	$: itemTypeFiltersClear = itemTypes.every((itemType) => !itemTypeFilters[itemType]);
	$: itemTypeFiltersFriendlyDescription = () => {
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
	};

	$: fuzzysortedResults = [
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
		.map((keyResult) => keyResult.obj);

	$: filteredResults = [
		...fuzzysortedResults,
		...searchResults.filter(
			(result) =>
				!fuzzysortedResults.find((fuzzysortedResult) => fuzzysortedResult.id === result.id)
		)
	].filter((item) => itemTypeFilters[item.type] || itemTypeFiltersClear);

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

	const onSearchSubmit = async () => {
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

	const onItemClick = (event: Event) => {
		if (!$loading) {
			return;
		}

		event.preventDefault();
	};
</script>

<div class="sticky top-0 p-4 -mt-4 bg-surface-50-900-token">
	<form on:submit|preventDefault={onSearchSubmit}>
		<label class="label">
			<span class="sr-only">Search</span>
			<div class="input-group flex bg-surface-50-900-token !border-surface-900-50-token">
				<div class="relative grow text-surface-900-50-token bg-surface-50-900-token !px-0">
					<div class="absolute">
						<SearchLoop />
					</div>
					<input
						type="search"
						placeholder="Search..."
						bind:value={searchQuery}
						disabled={$loading}
						on:input={onSearchInput}
						class="pl-14 pr-4 !bg-surface-50-900-token focus:!ring-4 focus:ring-inset focus:ring-surface-500 grow"
					/>
				</div>
				<button
					class="bg-surface-900-50-token text-surface-50-900-token focus:-outline-offset-4"
					disabled={$loading}
				>
					Submit
				</button>
			</div>
		</label>
		<small
			role={showSearchError || showAddError ? 'alert' : ''}
			class="text-error-600-300-token min-h-[1.5rem] block text-center"
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
					class="chip rounded-token"
					class:variant-filled={itemTypeFilters[itemType]}
					class:variant-soft-surface={!itemTypeFilters[itemType]}
					on:click={() => filterItemTypes(itemType)}
					on:keypress={(event) => {
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
				class="chip rounded-token"
				class:variant-soft-error={itemTypeFiltersClear}
				class:variant-filled-error={!itemTypeFiltersClear}
				on:click={clearItemTypeFilters}
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
				<span role="alert" class="text-error-600-300-token">
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
		<ListBox spacing="">
			{#each filteredResults as item, i (item.id)}
				<ListBoxItem
					bind:group={selectedItemId}
					name="item"
					value={item.id}
					padding="p-4 focus:!-outline-offset-4"
					on:click={onItemClick}
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
				</ListBoxItem>
				{#if i !== filteredResults.length - 1}
					<hr class="!border-t-4" />
				{/if}
			{/each}
		</ListBox>
	{/if}
</div>

<div class="sticky bottom-0 -mb-4 p-4 flex justify-center gap-4 bg-surface-50-900-token">
	<button
		class="btn bg-surface-900-50-token text-surface-50-900-token"
		type="submit"
		disabled={$loading}
		on:click={onSelectionSubmit}
	>
		Add
	</button>
	<button
		class="btn variant-soft"
		type="button"
		disabled={$loading}
		on:click={() => goToListPage()}
	>
		Cancel
	</button>
</div>
