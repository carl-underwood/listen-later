<script lang="ts">
	import Headphone from './icons/headphone.svelte';
	import type ItemMetadata from '$lib/types/ItemMetadata';
	import ImageWithFallback from './ImageWithFallback.svelte';

	let { itemMetadata }: { itemMetadata: ItemMetadata | null | undefined } = $props();
</script>

{#if itemMetadata === undefined}
	<div class="placeholder animate-pulse h-16 w-16"></div>
{:else if itemMetadata?.imageUrl}
	<ImageWithFallback
		classes="h-16 w-16 object-cover"
		imagesInOrderOfPrecedence={[{ src: itemMetadata.imageUrl, alt: '' }]}
	>
		{#snippet finalFallback()}
			<div class="h-16 w-16 bg-surface-500 flex justify-center items-center">
				<Headphone classes="h-6 w-6 text-white" />
			</div>
		{/snippet}
	</ImageWithFallback>
{:else}
	<div class="h-16 w-16 bg-surface-500 flex justify-center items-center">
		<Headphone classes="h-6 w-6 text-white" />
	</div>
{/if}
