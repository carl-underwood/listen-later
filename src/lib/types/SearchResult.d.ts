import type Item from './Item';

type SearchResult = Readonly<
	Omit<Item, 'addedAtUtc' | 'listened'> & {
		readonly popularity: number;
		readonly metadata: string[];
		readonly imageUrl: string | null;
	}
>;

export default SearchResult;
