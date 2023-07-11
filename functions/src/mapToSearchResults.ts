import type { Artist, GetEpisodesResponse, Image, SearchResponse } from './types/spotify';
import type SearchResult from '../../src/lib/types/SearchResult';

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
		metadata: [upperFirstCharacter(item.album_type), getArtists(item.artists)],
		spotifyUrl: item.external_urls.spotify,
		type: 'album'
	}));

	const artistResults: SearchResult[] = searchResponse.artists.items.map((item) => ({
		id: item.id,
		imageUrl: getImage(item.images),
		name: item.name,
		metadata: ['Artist'],
		spotifyUrl: item.external_urls.spotify,
		type: 'artist'
	}));

	const episodeResults: SearchResult[] = searchResponse.episodes.items.map((item) => ({
		id: item.id,
		imageUrl: getImage(item.images),
		name: item.name,
		metadata: [
			'Episode',
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			episodesResponse.episodes.find((episode) => episode.id === item.id)!.show.name
		],
		spotifyUrl: item.external_urls.spotify,
		type: 'episode'
	}));

	const showResults: SearchResult[] = searchResponse.shows.items.map((item) => ({
		id: item.id,
		imageUrl: getImage(item.images),
		name: item.name,
		metadata: ['Podcast'],
		spotifyUrl: item.external_urls.spotify,
		type: 'podcast'
	}));

	const trackResults: SearchResult[] = searchResponse.tracks.items.map((item) => ({
		id: item.id,
		imageUrl: getImage(item.album.images),
		name: item.name,
		metadata: ['Song', getArtists(item.artists), item.album.name],
		spotifyUrl: item.external_urls.spotify,
		type: 'track'
	}));

	return [...albumResults, ...artistResults, ...episodeResults, ...showResults, ...trackResults];
};

const getArtists = (artists: Artist[]) => {
	return artists.map((artist) => artist.name).join(', ');
};

const getImage = (images: Image[]) => {
	// Return the largest image for now
	return images[0]?.url || null;
};
