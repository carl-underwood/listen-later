import { get } from 'svelte/store';
import { httpsCallable } from '@firebase/functions';
import { appCheck } from '../stores/appCheck';
import { functions } from '../stores/functions';
import type Item from '../types/Item';

export const search = async (searchQuery: string): Promise<Item[]> => {
	const $appCheck = get(appCheck);
	const $functions = get(functions);
	if (!$appCheck || !$functions) {
		return [];
	}

	const search = httpsCallable($functions, 'search');

	const result = await search({ searchQuery });

	console.log(result);
	return [];
};
