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

export function createItems() {
	let items: Item[] | undefined = undefined;

	const { subscribe } = derived<[Readable<Firestore>, Readable<User | null>], Item[]>(
		[firestore, user],
		([$firestore, $user], set) => {
			let unsubscribe = () => {
				return;
			};

			if (!$firestore || !$user || !browser) {
				return unsubscribe;
			}

			const q = query(collection($firestore, `users/${$user.uid}/items`));
			// q = query(q, orderBy('addedAtUtc', 'desc'));

			unsubscribe = onSnapshot(q, (snapshot) => {
				items = snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id } as Item));
				set(items);
			});

			return unsubscribe;
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
