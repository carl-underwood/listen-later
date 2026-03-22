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

	const { subscribe } = derived([rawItemsStore, sortOrder], ([$rawItemsStore, $sortOrder]) => {
		if ($rawItemsStore === undefined) return undefined;

		const sortedItems = [...$rawItemsStore];
		sortedItems.sort((a, b) => {
			if ($sortOrder === 'addedAtUtcDescending') {
				return a.addedAtUtc > b.addedAtUtc ? -1 : 1;
			}
			return a.addedAtUtc > b.addedAtUtc ? 1 : -1;
		});

		return sortedItems;
	});

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
