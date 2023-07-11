<script lang="ts">
	import { goto } from '$app/navigation';

	import { items } from '$lib/stores/items';
	import { functions } from '$lib/stores/functions';
	import { loading } from '$lib/stores/loading';
	import { search } from '$lib/functions/search';
	import type Item from '$lib/types/Item';
	import SearchLoop from '$lib/components/icons/search-loop.svelte';
	import { ListBox, ListBoxItem } from '@skeletonlabs/skeleton';
	import Loading from '$lib/components/Loading.svelte';
	import Headphone from '$lib/components/icons/headphone.svelte';

	const MINIMUM_SEARCH_QUERY_LENGTH = 3;

	$: $functions;
	$: $items;

	let searchResults: Item[] = [];
	let lastSearchQuery = '';
	let searchQuery = '';
	let searching = false;
	let showSearchError = false;
	let selectedItemId = '';

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
			lastSearchQuery = searchQuery;
			searchResults = [];
			selectedItemId = '';
			searching = true;

			searchResults = await search(searchQuery);

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

<div class="sticky top-4">
	<form on:submit={onSearchSubmit}>
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
		<small role={showSearchError ? 'alert' : ''} class="text-error-500 min-h-[1.5rem] block">
			{#if showSearchError}
				Please enter a search query of at least {MINIMUM_SEARCH_QUERY_LENGTH} characters
			{/if}
		</small>
	</form>
</div>

<div aria-live="assertive" class="m-b-4">
	{#if searching}
		<Loading />
	{:else if !searchResults.length}
		{#if lastSearchQuery}
			<span>Nothing found!</span>
			<span>Please try searching for something else.</span>
		{:else}
			<span>Search for something above!</span>
		{/if}
	{:else}
		<ListBox>
			{#each searchResults as item, i (item.id)}
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
								<img class="h-12 w-12" src={item.imageUrl} alt="" loading="lazy" />
							{:else}
								<div class="h-12 w-12 bg-surface-500 flex justify-center items-center">
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
				{#if i !== searchResults.length - 1}
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
