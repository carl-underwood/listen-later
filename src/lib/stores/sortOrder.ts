import { derived, get, type Readable } from 'svelte/store';
import { browser } from '$app/environment';
import { doc, type Firestore, onSnapshot, setDoc } from '@firebase/firestore';
import type { User } from '@firebase/auth';
import type { SortOrder } from '$lib/types/SortOrder';
import { addedAtUtcDescending, sortOrders } from '$lib/types/SortOrder';
import { firestore } from './firestore';
import { user } from './user';

export function createSortOrder() {
	const rawSortOrderStore = derived<[Readable<Firestore>, Readable<User | null>], SortOrder>(
		[firestore, user],
		([$firestore, $user], set) => {
			let unsubscribe = () => {
				return;
			};

			if (!$firestore || !$user || !browser) {
				set(addedAtUtcDescending);
				return unsubscribe;
			}

			unsubscribe = onSnapshot(doc($firestore, `users/${$user.uid}`), (snapshot) => {
				const data = snapshot.data();
				const fetchedOrder = data?.sortOrder;
				// Default to newest to oldest if unpopulated or unknown
				if (sortOrders.includes(fetchedOrder as SortOrder)) {
					set(fetchedOrder as SortOrder);
				} else {
					set(addedAtUtcDescending);
				}
			});

			return unsubscribe;
		},
		addedAtUtcDescending // initial value
	);

	const setOrder = async (order: SortOrder) => {
		const $firestore = get(firestore);
		const $user = get(user);
		if (!$firestore || !$user) {
			return;
		}

		await setDoc(doc($firestore, `users/${$user.uid}`), { sortOrder: order }, { merge: true });
	};

	return { subscribe: rawSortOrderStore.subscribe, set: setOrder };
}

export const sortOrder = createSortOrder();
