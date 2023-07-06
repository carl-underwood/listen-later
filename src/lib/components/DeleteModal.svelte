<script lang="ts">
	import { items } from '$lib/stores/items';
	import { loading } from '$lib/stores/loading';

	import type Item from '$lib/types/Item';
	import { modalStore } from '@skeletonlabs/skeleton';

	export let item: Item;

	const deleteItem = async (itemId: string) => {
		await loading.whileAwaiting(() => items.deleteItem(itemId));
		closeModal();
	};

	const closeModal = () => modalStore.close();
</script>

<div class="card p-4">
	<p>Are you sure you want to delete {item.name}?</p>
	<div class="mt-4 flex gap-4 justify-center">
		<button
			class="btn bg-gradient-to-br variant-filled-error"
			disabled={$loading}
			on:click={() => deleteItem(item.id)}
		>
			Delete
		</button>
		<button class="btn variant-soft" disabled={$loading} on:click={closeModal}>Cancel</button>
	</div>
</div>
