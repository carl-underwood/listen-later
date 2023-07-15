<script lang="ts">
	import { slide } from 'svelte/transition';
	import { page } from '$app/stores';
	import { Accordion } from '@skeletonlabs/skeleton';
	import smoothScrollIntoViewIfNeeded from 'smooth-scroll-into-view-if-needed';
	import { items } from '$lib/stores/items';
	import { loading } from '$lib/stores/loading';
	import { prefersReducedMotion } from '$lib/stores/prefersReducedMotion';
	import Loading from '$lib/components/Loading.svelte';
	import Plus from '$lib/components/icons/plus.svelte';
	import preventDefaultIf from '$lib/helpers/preventDefaultIf';
	import ItemSpotify from '$lib/components/ItemSpotify.svelte';

	let accordionItems: { [Property: string]: HTMLDivElement } = {};
	$: openAccordionItemId = $page.url.searchParams.get('itemId');

	$: if (openAccordionItemId && accordionItems[openAccordionItemId]) {
		smoothScrollIntoViewIfNeeded(accordionItems[openAccordionItemId], {
			behavior: 'smooth',
			duration: 800
		});
	}
</script>

{#if $items === undefined}
	<Loading />
{:else}
	<h1 class="sr-only">List</h1>
	<a
		href="/list/add"
		class="btn bg-surface-900-50-token text-surface-50-900-token sticky top-4 left-1/2 -translate-x-1/2 w-36"
		class:opacity-50={$loading}
		class:cursor-not-allowed={$loading}
		on:click={(event) => preventDefaultIf(event, $loading)}
	>
		<Plus />
		<span class="sr-only">Add item</span>
	</a>
	<div class="my-5">
		{#if !$items.length}
			<span
				class="block text-center mx-4"
				transition:slide={{ duration: $prefersReducedMotion ? 0 : undefined }}
			>
				Nothing here yet! Use the button above to add an item 👆
			</span>
		{/if}
		<Accordion disabled={$loading} spacing="" padding="p-4">
			{#each $items as item (item.id)}
				<div
					bind:this={accordionItems[item.id]}
					transition:slide={{ duration: $prefersReducedMotion ? 0 : undefined }}
					class="border-surface-900-50-token ring-4 ring-surface-900-50-token mt-1"
				>
					{#if item.service === 'spotify'}
						<ItemSpotify {item} {openAccordionItemId} />
					{/if}
				</div>
			{/each}
		</Accordion>
	</div>
{/if}
