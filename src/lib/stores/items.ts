import { derived, get, type Readable } from 'svelte/store';
import { browser } from '$app/environment';
import {
	collection,
	deleteDoc,
	doc,
	type Firestore,
	onSnapshot,
	query,
	setDoc
} from '@firebase/firestore';
import type { User } from '@firebase/auth';
import type Item from '../types/Item';
import { firestore } from './firestore';
import { user } from './user';
import { sortOrder } from './sortOrder';
import { filter } from './filter';

export type ItemsState = {
	allItems: Item[];
	filteredAndSortedItems: Item[];
};

export function createItems() {
	const rawItemsStore = derived<[Readable<Firestore>, Readable<User | null>], Item[] | undefined>(
		[firestore, user],
		([$firestore, $user], set) => {
			let unsubscribe = () => {
				return;
			};

			if (!$firestore || !$user || !browser) {
				set(undefined);
				return unsubscribe;
			}

			const q = query(collection($firestore, `users/${$user.uid}/items`));

			unsubscribe = onSnapshot(q, (snapshot) => {
				set(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }) as Item));
			});

			return unsubscribe;
		}
	);

	const { subscribe } = derived<
		[typeof rawItemsStore, typeof sortOrder, typeof filter],
		ItemsState | undefined
	>(
		[rawItemsStore, sortOrder, filter],
		([$rawItemsStore, $sortOrder, $filter]) => {
			if ($rawItemsStore === undefined) return undefined;

			let processedItems = [...$rawItemsStore];

			if ($filter) {
				if ($filter.types && $filter.types.length > 0) {
					processedItems = processedItems.filter((item) => $filter.types.includes(item.type));
				}
				if ($filter.listened !== null) {
					processedItems = processedItems.filter((item) => item.listened === $filter.listened);
				}
			}

			processedItems.sort((a, b) => {
				if ($sortOrder === 'addedAtUtcDescending') {
					return a.addedAtUtc > b.addedAtUtc ? -1 : 1;
				}
				return a.addedAtUtc > b.addedAtUtc ? 1 : -1;
			});

			return {
				allItems: $rawItemsStore,
				filteredAndSortedItems: processedItems
			};
		}
	);

	const upsertItem = async (item: Item) => {
		const $firestore = get(firestore);
		const $user = get(user);
		if (!$firestore || !$user) {
			return;
		}

		await setDoc(doc($firestore, `users/${$user.uid}/items`, item.id), item);
	};

	const deleteItem = async (itemId: string) => {
		const $firestore = get(firestore);
		const $user = get(user);
		if (!$firestore || !$user) {
			return;
		}

		await deleteDoc(doc($firestore, `users/${$user.uid}/items`, itemId));
	};

	return { subscribe, upsertItem, deleteItem };
}

export const items = createItems();
