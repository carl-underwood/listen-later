import type {
	Album,
	Artist,
	GetEpisodesResponse,
	Image,
	SearchResponse,
	Show,
	Track
} from './types/spotify';
import type SearchResult from '../../src/lib/types/SearchResult';
import type ItemType from '../../src/lib/types/ItemType';
import type ItemMetadata from '../../src/lib/types/ItemMetadata';

const upperFirstCharacter = (input: string) => [input[0].toUpperCase(), ...input.slice(1)].join('');

// Designed as a back-end for front-end, so performing mapping here
export const mapToSearchResults = (
	searchResponse: SearchResponse,
	episodesResponse: GetEpisodesResponse
): SearchResult[] => {
	const albumResults: SearchResult[] = searchResponse.albums.items.map((item) => ({
		id: item.id,
		imageUrl: getImage(item.images),
		name: item.name,
		metadataParts: [upperFirstCharacter(item.album_type), getArtists(item.artists)],
		url: item.external_urls.spotify,
		service: 'spotify',
		type: 'album',
		popularity: item.popularity
	}));

	const artistResults: SearchResult[] = searchResponse.artists.items.map((item) => ({
		id: item.id,
		imageUrl: getImage(item.images),
		name: item.name,
		metadataParts: ['Artist'],
		url: item.external_urls.spotify,
		service: 'spotify',
		type: 'artist',
		popularity: item.popularity
	}));

	const episodeResults: SearchResult[] = searchResponse.episodes.items.map((item) => ({
		id: item.id,
		imageUrl: getImage(item.images),
		name: item.name,
		metadataParts: [
			'Episode',
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			episodesResponse.episodes.find((episode) => episode.id === item.id)!.show.name
		],
		url: item.external_urls.spotify,
		service: 'spotify',
		type: 'episode',
		popularity: -1
	}));

	const showResults: SearchResult[] = searchResponse.shows.items.map((item) => ({
		id: item.id,
		imageUrl: getImage(item.images),
		name: item.name,
		metadataParts: ['Podcast'],
		url: item.external_urls.spotify,
		service: 'spotify',
		type: 'podcast',
		popularity: -1
	}));

	const trackResults: SearchResult[] = searchResponse.tracks.items.map((item) => ({
		id: item.id,
		imageUrl: getImage(item.album.images),
		name: item.name,
		metadataParts: ['Song', getArtists(item.artists), item.album.name],
		url: item.external_urls.spotify,
		service: 'spotify',
		type: 'track',
		popularity: item.popularity
	}));

	return [...albumResults, ...artistResults, ...episodeResults, ...showResults, ...trackResults];
};

// Designed as a back-end for front-end, so performing mapping here
export const mapToItemMetadata = (
	itemType: ItemType,
	spotifyResponse: unknown
): (ItemMetadata & { itemId: string })[] => {
	if (itemType === 'album') {
		return (spotifyResponse as { albums: Album[] }).albums.map((item) => ({
			itemId: item.id,
			imageUrl: getImage(item.images),
			metadataParts: [upperFirstCharacter(item.album_type), getArtists(item.artists)]
		}));
	}

	if (itemType === 'artist') {
		return (spotifyResponse as { artists: Artist[] }).artists.map((item) => ({
			itemId: item.id,
			imageUrl: getImage(item.images),
			metadataParts: [upperFirstCharacter(itemType)]
		}));
	}

	if (itemType === 'episode') {
		return (spotifyResponse as GetEpisodesResponse).episodes.map((item) => ({
			itemId: item.id,
			imageUrl: getImage(item.images),
			metadataParts: [upperFirstCharacter(itemType), item.show.name]
		}));
	}

	if (itemType === 'podcast') {
		return (spotifyResponse as { shows: Show[] }).shows.map((item) => ({
			itemId: item.id,
			imageUrl: getImage(item.images),
			metadataParts: [upperFirstCharacter(itemType)]
		}));
	}

	if (itemType === 'track') {
		return (spotifyResponse as { tracks: Track[] }).tracks.map((item) => ({
			itemId: item.id,
			imageUrl: getImage(item.album.images),
			metadataParts: ['Song', getArtists(item.artists), item.album.name]
		}));
	}

	return [];
};

const getArtists = (artists: Artist[]) => {
	return artists.map((artist) => artist.name).join(', ');
};

const getImage = (images: Image[]) => {
	// Return the largest image for now
	return images[0]?.url || null;
};
