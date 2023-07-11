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
	import Headphone from '$lib/components/icons/headphone.svelte';
	import Check from '$lib/components/icons/check.svelte';
	import type ItemType from '$lib/types/ItemType';
	import { itemTypes } from '$lib/types/ItemType';

	const MINIMUM_SEARCH_QUERY_LENGTH = 3;

	$: $functions;
	$: $items;

	let searchResults: SearchResult[] = [];
	let lastSearchQuery = '';
	let searchQuery = '';
	let searching = false;
	let showSearchError = false;
	let selectedItemId = '';

	let itemTypeFilters: { [Property in ItemType]: boolean } = {
		album: false,
		artist: false,
		episode: false,
		podcast: false,
		track: false
	};

	$: itemTypeFiltersClear = itemTypes.every((itemType) => !itemTypeFilters[itemType]);
	$: itemTypeFiltersFriendlyDescription = () => {
		const commaSeparatedItemTypeFilters = itemTypes
			.filter((itemType) => itemTypeFilters[itemType])
			.join(', ');

		console.log(commaSeparatedItemTypeFilters);

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
			track: false
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
			selectedItemId = '';
			searching = true;

			searchResults = await search(searchQuery);
			lastSearchQuery = searchQuery;

			searching = false;
		});
	};

	const onSelectionSubmit = async () => {
		if (!selectedItemId) {
			return;
		}

		const selectedItem = searchResults.find((item) => item.id == selectedItemId);

		if (!selectedItem) {
			return;
		}

		const item: Item = {
			addedAtUtc: new Date().toISOString(),
			id: selectedItem.id,
			imageUrl: selectedItem.imageUrl,
			listened: false,
			metadata: selectedItem.metadata,
			name: selectedItem.name,
			spotifyUrl: selectedItem.spotifyUrl,
			type: selectedItem.type
		};

		await loading.whileAwaiting(() => items.upsertItem(item));
		goToListPage();
	};

	const goToListPage = () => goto('/list');

	const onItemClick = (event: Event) => {
		if (!$loading) {
			return;
		}

		event.preventDefault();
	};
</script>

<div class="sticky top-0 p-4 bg-surface-backdrop-token">
	<form on:submit|preventDefault={onSearchSubmit}>
		<label class="label">
			<span class="sr-only">Search</span>
			<div class="input-group input-group-divider grid-cols-[auto_1fr_auto]">
				<div class="input-group-shim"><SearchLoop /></div>
				<input
					type="search"
					placeholder="Search..."
					bind:value={searchQuery}
					disabled={$loading}
					on:input={onSearchInput}
				/>
				<button class="variant-filled-secondary" disabled={$loading}>Submit</button>
			</div>
		</label>
		<small
			role={showSearchError ? 'alert' : ''}
			class="text-error-400 min-h-[1.5rem] block text-center"
		>
			{#if showSearchError}
				Please enter a search query of at least {MINIMUM_SEARCH_QUERY_LENGTH} characters
			{/if}
		</small>
		<div class="mb-4 flex flex-wrap gap-4 justify-center">
			<span class="sr-only">Filters</span>
			{#each itemTypes as itemType}
				<span
					class="chip {itemTypeFilters[itemType] ? 'variant-filled' : 'variant-soft'}"
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
				class="chip {itemTypeFiltersClear ? 'variant-soft-error' : 'variant-filled-error'}"
				on:click={clearItemTypeFilters}
				type="button"
			>
				Clear <span class="sr-only">filters</span>
			</button>
		</div>
	</form>
</div>

<div aria-live="assertive" class="m-b-4">
	{#if searching}
		<Loading />
	{:else if !filteredResults.length}
		{#if lastSearchQuery}
			<span>Nothing found!</span>
			<span>
				Please try {searchResults.length
					? 'adjusting the filters'
					: 'searching for something else'}.
			</span>
		{:else}
			<span>Search for something above!</span>
		{/if}
	{:else}
		<span class="sr-only">
			Showing {itemTypeFiltersClear ? 'all' : itemTypeFiltersFriendlyDescription()}
			search results.
		</span>
		<ListBox>
			{#each filteredResults as item, i (item.id)}
				<ListBoxItem
					bind:group={selectedItemId}
					name="item"
					value={item.id}
					rounded="false"
					padding="p-4"
					on:click={onItemClick}
				>
					<div id={item.id} class="flex gap-4" class:cursor-not-allowed={$loading}>
						<div class="flex flex-col gap-2 shrink-0 justify-center items-center">
							{#if item.imageUrl}
								<img class="h-16 w-16" src={item.imageUrl} alt="" loading="lazy" />
							{:else}
								<div class="h-16 w-16 bg-surface-500 flex justify-center items-center">
									<Headphone classes="h-6 w-6 text-white" />
								</div>
							{/if}
						</div>
						<div class="flex flex-col">
							<span class="font-semibold">
								{item.name}
							</span>
							{#each item.metadata as metadataPart}
								<span>{metadataPart}</span>
							{/each}
						</div>
					</div>
				</ListBoxItem>
				{#if i !== filteredResults.length - 1}
					<hr class="!border-t-2" />
				{/if}
			{/each}
		</ListBox>
	{/if}
</div>

<div class="sticky bottom-4">
	<button
		class="btn bg-gradient-to-br variant-gradient-secondary-tertiary"
		type="submit"
		disabled={$loading || !selectedItemId}
		on:click={onSelectionSubmit}
	>
		Add
	</button>
	<button class="btn variant-soft" type="button" disabled={$loading} on:click={goToListPage}>
		Cancel
	</button>
</div>
