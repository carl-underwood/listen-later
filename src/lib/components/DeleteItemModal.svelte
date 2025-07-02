<script lang="ts">
	import { items } from '$lib/stores/items';
	import { loading } from '$lib/stores/loading';

	import type Item from '$lib/types/Item';
	const modalStore = getModalStore();

	let { item }: { item: Item } = $props();

	const deleteItem = async (itemId: string) => {
		await loading.whileAwaiting(() => items.deleteItem(itemId));
		closeModal();
	};

	const closeModal = () => modalStore.close();
</script>

<div class="card p-4">
	<p>Are you sure you want to delete <em>{item.name}</em>?</p>
	<div class="mt-4 flex gap-4 justify-center">
		<button class="btn preset-tonal" disabled={$loading} onclick={closeModal}>Cancel</button>
		<button
			class="btn bg-gradient-to-br preset-filled-error-500"
			disabled={$loading}
			onclick={() => deleteItem(item.id)}
		>
			Delete
		</button>
	</div>
</div>
