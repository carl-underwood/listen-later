import type ItemType from './ItemType';

export default interface Item {
	id: string;
	type: ItemType;
	name: string;
	metadata: string[];
	spotifyUrl: string;
	imageUrl: string | null;
	addedAtUtc: string;
	listened: boolean;
}
