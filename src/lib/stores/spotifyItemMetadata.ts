import type ItemMetadata from '$lib/types/ItemMetadata';

import { derived, type Readable } from 'svelte/store';
import type Item from '../types/Item';
import { items } from './items';
import { getSpotifyMetadata } from '$lib/functions/getSpotifyMetadata';
import arrayChunks from '$lib/helpers/arrayChunks';
import type ItemType from '$lib/types/ItemType';
import type { AppCheck } from 'firebase/app-check';
import type { Functions } from 'firebase/functions';
import { appCheck } from './appCheck';
import { functions } from './functions';
import getPrefixlessId from '$lib/helpers/getPrefixlessId';

type SpotifyItemMetadata = {
	[itemId: string]: ItemMetadata | null;
};

export function createSpotifyItemMetadata() {
	let loadingPrefixlessItemIds: string[] = [];
	let spotifyItemMetadata: SpotifyItemMetadata = {};

	const { subscribe } = derived<
		[Readable<Item[]>, Readable<AppCheck>, Readable<Functions>],
		SpotifyItemMetadata
	>(
		[items, appCheck, functions],
		([$items, $appCheck, $functions], set) => {
			if (!$items || !$items.length || !$appCheck || !$functions) {
				return;
			}

			const itemsToLoad = $items.filter(
				(item) =>
					!loadingPrefixlessItemIds.includes(getPrefixlessId(item)) &&
					spotifyItemMetadata[getPrefixlessId(item)] === undefined
			);

			const handleBatchError = (batch: string[]) => {
				loadingPrefixlessItemIds = loadingPrefixlessItemIds.filter(
					(loadingItemId) => !batch.includes(loadingItemId)
				);

				const batchMetadata = batch.reduce<SpotifyItemMetadata>(
					(obj, itemId) => ({ ...obj, [itemId]: null }),
					{}
				);

				spotifyItemMetadata = { ...spotifyItemMetadata, ...batchMetadata };
				set(spotifyItemMetadata);
			};

			const handleBatchSuccess = (batchResult: (ItemMetadata & { itemId: string })[]) => {
				loadingPrefixlessItemIds = loadingPrefixlessItemIds.filter(
					(loadingItemId) =>
						!batchResult.find((batchItemMetadata) => batchItemMetadata.itemId === loadingItemId)
				);

				const batchMetadata = batchResult.reduce<SpotifyItemMetadata>(
					(obj, itemMetadata) => ({ ...obj, [itemMetadata.itemId]: itemMetadata }),
					{}
				);

				spotifyItemMetadata = { ...spotifyItemMetadata, ...batchMetadata };
				set(spotifyItemMetadata);
			};

			const fetchInBatches = (itemType: ItemType, batchSize: number) => {
				arrayChunks(
					itemsToLoad.filter((item) => item.type === itemType).map(getPrefixlessId),
					batchSize
				).forEach((batch) =>
					getSpotifyMetadata(itemType, batch)
						.then(handleBatchSuccess)
						.catch(() => handleBatchError(batch))
				);
			};

			fetchInBatches('album', 20);
			fetchInBatches('artist', 50);
			fetchInBatches('episode', 50);
			fetchInBatches('podcast', 50);
			fetchInBatches('song', 50);
		},
		{}
	);

	return { subscribe };
}

export const spotifyItemMetadata = createSpotifyItemMetadata();
