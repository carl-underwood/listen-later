<script lang="ts">
	import { getDrawerStore, AppBar } from '@skeletonlabs/skeleton';
	import { sortOrder } from '$lib/stores/sortOrder';
	import Close from '$lib/components/icons/close.svelte';
	import { addedAtUtcAscending, addedAtUtcDescending } from '$lib/types/SortOrder';
	import { drawerIds } from '$lib/types/Drawers';

	const drawerStore = getDrawerStore();

	let temporarySortOrder = $state($sortOrder);

	const sort = () => {
		$sortOrder = temporarySortOrder;
		drawerStore.close();
	};
</script>

{#if $drawerStore.id === drawerIds.sort}
	<div id="sort-drawer-inner" class="flex flex-col max-w-md mx-auto">
		<AppBar slotTrail="place-content-end">
			{#snippet lead()}
				<h2 class="h2 ml-4">Sort Items</h2>
			{/snippet}
			{#snippet trail()}
				<button type="button" class="btn-icon bg-transparent" onclick={drawerStore.close}>
					<Close />
					<span class="sr-only">Close sort drawer</span>
				</button>
			{/snippet}
		</AppBar>

		<div class="flex flex-col gap-4 px-8 py-4">
			<span id="drawer-label" class="sr-only">Sort drawer</span>
			<label class="flex items-center space-x-2">
				<input
					class="radio"
					type="radio"
					value={addedAtUtcDescending}
					bind:group={temporarySortOrder}
					name="sortOrder"
				/>
				<span class="text-xl">Newest to oldest</span>
			</label>
			<label class="flex items-center space-x-2">
				<input
					class="radio"
					type="radio"
					value={addedAtUtcAscending}
					bind:group={temporarySortOrder}
					name="sortOrder"
				/>
				<span class="text-xl">Oldest to newest</span>
			</label>

			<div class="flex justify-center mx-8 mt-4 sticky bottom-4">
				<button
					class="btn bg-surface-900-50-token text-surface-50-900-token"
					onclick={sort}
					style="width: 8rem;"
				>
					Sort
				</button>
			</div>
		</div>
	</div>
{/if}
