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
		classes="h-16 w-16"
		imagesInOrderOfPrecedence={[{ src: itemMetadata.imageUrl, alt: '' }]}
	>
		<div slot="finalFallback" class="h-16 w-16 bg-surface-500 flex justify-center items-center">
			<Headphone classes="h-6 w-6 text-white" />
		</div>
	</ImageWithFallback>
{:else}
	<div class="h-16 w-16 bg-surface-500 flex justify-center items-center">
		<Headphone classes="h-6 w-6 text-white" />
	</div>
{/if}
