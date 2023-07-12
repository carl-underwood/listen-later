import type Item from './Item';

type SearchResult = Readonly<
	Omit<Item, 'addedAtUtc' | 'listened'> & {
		readonly popularity: number;
	}
>;

export default SearchResult;
