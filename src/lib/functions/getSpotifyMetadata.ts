import { get } from 'svelte/store';
import { httpsCallable } from '@firebase/functions';
import { appCheck } from '../stores/appCheck';
import { functions } from '../stores/functions';
import type ItemMetadata from '$lib/types/ItemMetadata';
import type ItemType from '$lib/types/ItemType';

export const getSpotifyMetadata = async (
	itemType: ItemType,
	prefixlessItemIds: string[]
): Promise<(ItemMetadata & { itemId: string })[]> => {
	const $appCheck = get(appCheck);
	const $functions = get(functions);
	if (!$appCheck || !$functions) {
		return [];
	}

	const getSpotifyMetadata = httpsCallable($functions, 'getSpotifyMetadata');

	const result = await getSpotifyMetadata({ itemType, prefixlessItemIds });

	return result.data as (ItemMetadata & { itemId: string })[];
};
