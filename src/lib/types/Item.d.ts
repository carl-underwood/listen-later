import type ItemType from './ItemType';
import type Service from './Service';

export default interface Item {
	id: string;
	service: Service;
	type: ItemType;
	name: string;
	url: string;
	addedAtUtc: string;
	listened: boolean;
}
