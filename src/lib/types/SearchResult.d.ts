import type Item from './Item';
import type ItemMetadata from './ItemMetadata';

type SearchResult = Readonly<
	Omit<Item, 'addedAtUtc' | 'listened'> &
		ItemMetadata & {
			readonly popularity: number;
		}
>;

export default SearchResult;
