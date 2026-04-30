<script lang="ts">
	import { getDrawerStore, AppBar } from '@skeletonlabs/skeleton';
	import { filter } from '$lib/stores/filter';
	import Close from '$lib/components/icons/close.svelte';
	import { drawerIds } from '$lib/types/Drawers';
	import { itemTypes } from '$lib/types/ItemType';
	import type Filter from '$lib/types/Filter';

	const drawerStore = getDrawerStore();

	let temporaryFilter: Filter = $state({ types: [], listened: null });

	$effect(() => {
		if ($drawerStore.id === drawerIds.filter) {
			temporaryFilter = {
				types: [...($filter.types || [])],
				listened: $filter.listened
			};
		}
	});

	const applyFilter = () => {
		$filter = {
			types: [...temporaryFilter.types],
			listened: temporaryFilter.listened
		};
		drawerStore.close();
	};

	const clearFilter = () => {
		filter.reset();
		drawerStore.close();
	};

	const toggleType = (type: string) => {
		if (temporaryFilter.types.includes(type as any)) {
			temporaryFilter.types = temporaryFilter.types.filter((t) => t !== type);
		} else {
			temporaryFilter.types = [...temporaryFilter.types, type as any];
		}
	};
</script>

{#if $drawerStore.id === drawerIds.filter}
	<div id="filter-drawer-inner" class="flex flex-col max-w-md mx-auto">
		<AppBar slotTrail="place-content-end">
			{#snippet lead()}
				<h2 class="h2 ml-4">Filter Items</h2>
			{/snippet}
			{#snippet trail()}
				<button type="button" class="btn-icon bg-transparent" onclick={drawerStore.close}>
					<Close />
					<span class="sr-only">Close filter drawer</span>
				</button>
			{/snippet}
		</AppBar>

		<div class="flex flex-col gap-4 px-8 py-4">
			<span id="drawer-label" class="sr-only">Filter drawer</span>
			<h3 class="h3 sr-only">Item Type</h3>
			<div class="flex flex-col gap-2">
				{#each itemTypes as itemType}
					<label class="flex items-center space-x-2">
						<input
							class="checkbox"
							type="checkbox"
							checked={temporaryFilter.types.includes(itemType)}
							onchange={() => toggleType(itemType)}
						/>
						<span class="text-xl capitalize">{itemType}</span>
					</label>
				{/each}
			</div>

			<hr class="my-2 opacity-50" />

			<h3 class="h3 sr-only">Listened Status</h3>
			<div class="flex flex-col gap-2">
				<label class="flex items-center space-x-2">
					<input
						class="radio"
						type="radio"
						name="listenedStatus"
						checked={temporaryFilter.listened === null}
						onchange={() => (temporaryFilter.listened = null)}
					/>
					<span class="text-xl">All</span>
				</label>
				<label class="flex items-center space-x-2">
					<input
						class="radio"
						type="radio"
						name="listenedStatus"
						checked={temporaryFilter.listened === true}
						onchange={() => (temporaryFilter.listened = true)}
					/>
					<span class="text-xl">Listened</span>
				</label>
				<label class="flex items-center space-x-2">
					<input
						class="radio"
						type="radio"
						name="listenedStatus"
						checked={temporaryFilter.listened === false}
						onchange={() => (temporaryFilter.listened = false)}
					/>
					<span class="text-xl">Unlistened</span>
				</label>
			</div>

			<div class="flex justify-center gap-4 mx-8 mt-4 sticky bottom-4">
				<button
					class="btn bg-surface-900-50-token text-surface-50-900-token"
					onclick={applyFilter}
					style="width: 8rem;"
				>
					Apply
				</button>
				{#if filter.isFiltering($filter)}
					<button
						class="btn bg-surface-200-700-token text-surface-900-50-token"
						onclick={clearFilter}
						style="width: 8rem;"
					>
						Clear
					</button>
				{/if}
			</div>
		</div>
	</div>
{/if}
