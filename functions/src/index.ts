import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { defineString } from 'firebase-functions/params';
import { getAccessToken, search as spotifySearch, getItems } from './spotify';
import { mapToSearchResults, mapToItemMetadata } from './mapping';
import { itemTypes } from '../../src/lib/types/ItemType';
import type ItemType from '../../src/lib/types/ItemType';
import type { SpotifyItemType } from './types/spotify';

const SPOTIFY_CLIENT_ID = defineString('SPOTIFY_CLIENT_ID');
const SPOTIFY_CLIENT_SECRET = defineString('SPOTIFY_CLIENT_SECRET');

const MINIMUM_SEARCH_QUERY_LENGTH = 3;
const MAXIMUM_METADATA_ITEM_IDS = 50;

export const search = onCall({ enforceAppCheck: true, region: 'europe-west1' }, async (request) => {
	if (!request.auth) {
		throw new HttpsError('unauthenticated', 'Must be authenticated.');
	}

	const searchQuery = request.data.searchQuery;

	if (typeof searchQuery !== 'string' || searchQuery.length < MINIMUM_SEARCH_QUERY_LENGTH) {
		throw new HttpsError(
			'invalid-argument',
			`Must be called with a single string argument 'searchQuery' with ${MINIMUM_SEARCH_QUERY_LENGTH} or more characters.`
		);
	}

	const accessToken = await getAccessToken(
		SPOTIFY_CLIENT_ID.value(),
		SPOTIFY_CLIENT_SECRET.value()
	);

	const spotifySearchResponse = await spotifySearch(searchQuery, accessToken);
	const episodeIds = spotifySearchResponse.episodes.items.map((item) => item.id);
	const spotifyEpisodesResponse = await getItems('episodes', episodeIds, accessToken);

	return mapToSearchResults(spotifySearchResponse, spotifyEpisodesResponse);
});

export const getSpotifyMetadata = onCall(
	{ enforceAppCheck: true, region: 'europe-west1' },
	async (request) => {
		if (!request.auth) {
			throw new HttpsError('unauthenticated', 'Must be authenticated.');
		}

		const itemType = request.data.itemType as ItemType;
		const prefixlessItemIds = request.data.prefixlessItemIds;

		if (typeof itemType !== 'string' || !itemTypes.includes(itemType)) {
			throw new HttpsError(
				'invalid-argument',
				`Must be called with a string argument 'itemType' set to a valid item type.`
			);
		}

		if (!Array.isArray(prefixlessItemIds) || prefixlessItemIds.length > MAXIMUM_METADATA_ITEM_IDS) {
			throw new HttpsError(
				'invalid-argument',
				`Must be called with a string array argument 'prefixlessItemIds' with at most ${MAXIMUM_METADATA_ITEM_IDS} IDs.`
			);
		}

		const accessToken = await getAccessToken(
			SPOTIFY_CLIENT_ID.value(),
			SPOTIFY_CLIENT_SECRET.value()
		);

		const spotifyItemType = (
			itemType === 'podcast' ? 'shows' : itemType === 'song' ? 'tracks' : itemType + 's'
		) as SpotifyItemType;

		const spotifyResponse = await getItems(spotifyItemType, prefixlessItemIds, accessToken);

		return mapToItemMetadata(itemType, spotifyResponse);
	}
);
