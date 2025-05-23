<script lang="ts">
	import { slide } from 'svelte/transition';
	import { page } from '$app/state';
	import { Accordion } from '@skeletonlabs/skeleton';
	import smoothScrollIntoViewIfNeeded from 'smooth-scroll-into-view-if-needed';
	import { items } from '$lib/stores/items';
	import { loading } from '$lib/stores/loading';
	import { prefersReducedMotion } from '$lib/stores/prefersReducedMotion';
	import Loading from '$lib/components/Loading.svelte';
	import Plus from '$lib/components/icons/plus.svelte';
	import preventDefaultIf from '$lib/helpers/preventDefaultIf';
	import ItemSpotify from '$lib/components/ItemSpotify.svelte';
	import { user } from '$lib/stores/user';
	import PromoteAccountAlert from '$lib/components/PromoteAccountAlert.svelte';

	let accordionItems: { [Property: string]: HTMLDivElement } = $state({});
	let openAccordionItemId = $derived(page.url.searchParams.get('itemId'));

	$effect(() => {
		if (openAccordionItemId && accordionItems[openAccordionItemId]) {
			smoothScrollIntoViewIfNeeded(accordionItems[openAccordionItemId], {
				behavior: 'smooth',
				duration: 800
			});
		}
	});

	const slideWithPrefersReducedMotion = (node: Element) =>
		slide(node, { duration: $prefersReducedMotion ? 0 : undefined });
</script>

{#if $items === undefined}
	<Loading />
{:else}
	<div id="list-container" class="flex flex-col gap-4">
		<h1 class="sr-only">List</h1>
		{#if !$items.length}
			<span class="block text-center mx-4" transition:slideWithPrefersReducedMotion>
				Nothing here yet! Use the button below to add an item 👇
			</span>
		{:else if $user?.isAnonymous}
			<PromoteAccountAlert>
				<svelte:fragment slot="signInButton">
					<a
						href="/list/settings?promoteAccount=true"
						class="btn bg-surface-900-50-token text-surface-50-900-token"
					>
						Sign in
					</a>
				</svelte:fragment>
			</PromoteAccountAlert>
		{/if}
		<Accordion disabled={$loading} spacing="" padding="p-4">
			{#each $items as item (item.id)}
				<div
					bind:this={accordionItems[item.id]}
					transition:slideWithPrefersReducedMotion
					class="ring-4 ring-surface-900-50-token mt-1"
				>
					{#if item.service === 'spotify'}
						<ItemSpotify {item} {openAccordionItemId} />
					{/if}
				</div>
			{/each}
		</Accordion>
	</div>
	<a
		href="/list/add"
		class="btn bg-surface-900-50-token text-surface-50-900-token mt-5 sticky bottom-4 left-1/2 -translate-x-1/2 w-36"
		class:opacity-50={$loading}
		class:cursor-not-allowed={$loading}
		onclick={(event) => preventDefaultIf(event, $loading)}
	>
		<Plus />
		<span class="sr-only">Add item</span>
	</a>
{/if}

<style>
	#list-container {
		min-height: calc(
			100vh - (4.6875rem + 1rem + 3.875rem)
		); /* Top bar + bottom padding + add button */
		min-height: calc(
			100svh - (4.6875rem + 1rem + 3.875rem)
		); /* Top bar + bottom padding + add button */
	}
</style>
