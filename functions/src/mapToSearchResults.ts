import type { Artist, Image, SearchResponse } from './types/spotify';
import type SearchResult from '../../src/lib/types/SearchResult';

// Designed as a back-end for front-end, so performing mapping here
export const mapToSearchResults = (searchResponse: SearchResponse): SearchResult[] => {
	const albumResults: SearchResult[] = searchResponse.albums.items.map((item) => ({
		id: item.id,
		imageUrl: getImage(item.images),
		name: item.name,
		metadata: [getArtists(item.artists)],
		spotifyUrl: item.external_urls.spotify,
		type: 'album'
	}));

	const artistResults: SearchResult[] = searchResponse.artists.items.map((item) => ({
		id: item.id,
		imageUrl: getImage(item.images),
		name: item.name,
		metadata: [],
		spotifyUrl: item.external_urls.spotify,
		type: 'artist'
	}));

	const episodeResults: SearchResult[] = searchResponse.episodes.items.map((item) => ({
		id: item.id,
		imageUrl: getImage(item.images),
		name: item.name,
		metadata: ['TODO'],
		spotifyUrl: item.external_urls.spotify,
		type: 'episode'
	}));

	const showResults: SearchResult[] = searchResponse.shows.items.map((item) => ({
		id: item.id,
		imageUrl: getImage(item.images),
		name: item.name,
		metadata: [],
		spotifyUrl: item.external_urls.spotify,
		type: 'podcast'
	}));

	const trackResults: SearchResult[] = searchResponse.tracks.items.map((item) => ({
		id: item.id,
		imageUrl: getImage(item.album.images),
		name: item.name,
		metadata: [getArtists(item.artists), item.album.name],
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