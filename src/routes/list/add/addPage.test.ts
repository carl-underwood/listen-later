import '@testing-library/jest-dom';
import { describe, it, expect, afterEach, vi, type Mock } from 'vitest';
import { render, screen, cleanup } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import AddPage from './+page.svelte';
import type SearchResult from '$lib/types/SearchResult';
import { search } from '$lib/functions/search';
import { tick } from 'svelte';

vi.mock('$lib/functions/search', () => ({
	search: vi.fn()
}));

describe('add page', () => {
	afterEach(() => {
		vi.clearAllMocks();
		cleanup();
	});

	it('mounts', () => {
		const { container } = render(AddPage);
		expect(container).toBeTruthy();
	});

	it('allows search results to be filtered', async () => {
		const searchResults: SearchResult[] = [
			{
				id: 'album',
				imageUrl: '',
				metadata: [],
				name: 'album',
				popularity: 0,
				spotifyUrl: '',
				type: 'album'
			},
			{
				id: 'artist',
				imageUrl: '',
				metadata: [],
				name: 'artist',
				popularity: 0,
				spotifyUrl: '',
				type: 'artist'
			},
			{
				id: 'episode',
				imageUrl: '',
				metadata: [],
				name: 'episode',
				popularity: 0,
				spotifyUrl: '',
				type: 'episode'
			},
			{
				id: 'podcast',
				imageUrl: '',
				metadata: [],
				name: 'podcast',
				popularity: 0,
				spotifyUrl: '',
				type: 'podcast'
			},
			{
				id: 'track',
				imageUrl: '',
				metadata: [],
				name: 'track',
				popularity: 0,
				spotifyUrl: '',
				type: 'track'
			}
		];

		const searchMock = search as Mock<[string], Promise<SearchResult[]>>;
		searchMock.mockResolvedValue(searchResults);

		render(AddPage);

		const searchInput = await screen.findByLabelText('Search', { exact: true });
		await userEvent.type(searchInput, 'SearchQuery');
		await tick();

		const submitButton = await screen.findByRole('button', { name: 'Submit' });
		await userEvent.click(submitButton);
		await tick();

		expect(searchMock).toHaveBeenCalledWith('SearchQuery');

		const getOptions = async () => await screen.findAllByRole('option');
		expect(await getOptions()).toHaveLength(5);

		const albumsFilter = await screen.findByRole('checkbox', { name: 'albums' });
		await userEvent.click(albumsFilter);
		await tick();

		const albumFilteredOptions = await getOptions();
		expect(albumFilteredOptions).toHaveLength(1);
		expect(albumFilteredOptions[0]).toHaveTextContent('album');

		const clearFilterButton = await screen.findByRole('button', { name: 'Clear filters' });
		await userEvent.click(clearFilterButton);
		await tick();
		expect(await getOptions()).toHaveLength(5);

		const artistsFilter = await screen.findByRole('checkbox', { name: 'artists' });
		await userEvent.click(artistsFilter);
		await tick();

		const artistFilteredOptions = await getOptions();
		expect(artistFilteredOptions).toHaveLength(1);
		expect(artistFilteredOptions[0]).toHaveTextContent('artist');

		await userEvent.click(clearFilterButton);
		await tick();
		expect(await getOptions()).toHaveLength(5);

		const episodesFilter = await screen.findByRole('checkbox', { name: 'episodes' });
		await userEvent.click(episodesFilter);
		await tick();

		const episodeFilteredOptions = await getOptions();
		expect(episodeFilteredOptions).toHaveLength(1);
		expect(episodeFilteredOptions[0]).toHaveTextContent('episode');

		await userEvent.click(clearFilterButton);
		await tick();
		expect(await getOptions()).toHaveLength(5);

		const podcastsFilter = await screen.findByRole('checkbox', { name: 'podcasts' });
		await userEvent.click(podcastsFilter);
		await tick();

		const podcastFilteredOptions = await getOptions();
		expect(podcastFilteredOptions).toHaveLength(1);
		expect(podcastFilteredOptions[0]).toHaveTextContent('podcast');

		await userEvent.click(clearFilterButton);
		await tick();
		expect(await getOptions()).toHaveLength(5);

		const tracksFilter = await screen.findByRole('checkbox', { name: 'tracks' });
		await userEvent.click(tracksFilter);
		await tick();

		const trackFilteredOptions = await getOptions();
		expect(trackFilteredOptions).toHaveLength(1);
		expect(trackFilteredOptions[0]).toHaveTextContent('track');

		await userEvent.click(artistsFilter);
		await tick();

		const artistAndTrackFilteredOptions = await getOptions();
		expect(artistAndTrackFilteredOptions).toHaveLength(2);
		expect(artistAndTrackFilteredOptions[0]).toHaveTextContent('artist');
		expect(artistAndTrackFilteredOptions[1]).toHaveTextContent('track');
	});
});
