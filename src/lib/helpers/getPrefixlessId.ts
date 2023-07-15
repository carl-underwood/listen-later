import type Item from '$lib/types/Item';

const getPrefixlessId = (item: Item) => item.id.replace(`${item.service}:`, '');

export default getPrefixlessId;
