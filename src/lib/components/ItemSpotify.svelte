<script lang="ts">
	import { loading } from '$lib/stores/loading';
	import { spotifyItemMetadata } from '$lib/stores/spotifyItemMetadata';
	import getPrefixlessId from '$lib/helpers/getPrefixlessId';
	import ItemBase from './ItemBase.svelte';
	import SpotifyLogo from './SpotifyLogo.svelte';
	import preventDefaultIf from '$lib/helpers/preventDefaultIf';
	import SpotifyIcon from './SpotifyIcon.svelte';
	import type Item from '$lib/types/Item';
	import ItemImage from './ItemImage.svelte';

	let { item, openAccordionItemId }: { item: Item; openAccordionItemId: string | null } = $props();

	let itemMetadata = $derived($spotifyItemMetadata[getPrefixlessId(item)]);
</script>

<ItemBase {item} {openAccordionItemId}>
	<svelte:fragment slot="lead">
		<ItemImage {itemMetadata} />
		<SpotifyLogo classes="w-20" />
	</svelte:fragment>
	<svelte:fragment slot="metadata">
		{#if !itemMetadata}
			<span class="capitalize">{item.type}</span>
			{#if ['album', 'podcast', 'song'].includes(item.type)}
				<span class="{itemMetadata === undefined ? 'placeholder animate-pulse' : ''} h-6"></span>
			{/if}
			{#if item.type === 'song'}
				<span class="{itemMetadata === undefined ? 'placeholder animate-pulse' : ''} h-6"></span>
			{/if}
		{:else}
			{#each itemMetadata.metadataParts as metadataPart}
				<span class="break-word">{metadataPart}</span>
			{/each}
		{/if}
	</svelte:fragment>
	<svelte:fragment slot="openButton">
		<a
			href={item.url + '?go=1'}
			target="_blank"
			class="btn variant-ringed-surface font-semibold rounded-3xl"
			class:opacity-50={$loading}
			class:cursor-not-allowed={$loading}
			onclick={(event) => preventDefaultIf(event, $loading)}
		>
			<SpotifyIcon classes="w-6 h-6 mr-3 fill-[#83D269]" />
			Open in Spotify
		</a>
	</svelte:fragment>
</ItemBase>
