import type Item from './Item';

type SearchResult = Omit<Item, 'addedAtUtc' | 'listened'>;

export default SearchResult;
