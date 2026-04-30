import type { ItemType } from './ItemType';

export default interface Filter {
	types: ItemType[];
	listened: boolean | null;
}
