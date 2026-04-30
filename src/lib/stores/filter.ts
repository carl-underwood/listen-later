import { derived, get, type Readable } from 'svelte/store';
import { browser } from '$app/environment';
import { doc, type Firestore, onSnapshot, setDoc } from '@firebase/firestore';
import type { User } from '@firebase/auth';
import type Filter from '$lib/types/Filter';
import { firestore } from './firestore';
import { user } from './user';

const defaultFilter: Filter = { types: [], listened: null };

export function createFilter() {
	const rawFilterStore = derived<[Readable<Firestore>, Readable<User | null>], Filter>(
		[firestore, user],
		([$firestore, $user], set) => {
			let unsubscribe = () => {
				return;
			};

			if (!$firestore || !$user || !browser) {
				set(defaultFilter);
				return unsubscribe;
			}

			unsubscribe = onSnapshot(doc($firestore, `users/${$user.uid}`), (snapshot) => {
				const data = snapshot.data();
				const fetchedFilter = data?.filter as Filter | undefined;

				if (fetchedFilter) {
					set(fetchedFilter);
				} else {
					set(defaultFilter);
				}
			});

			return unsubscribe;
		},
		defaultFilter // initial value
	);

	const setFilter = async (filter: Filter) => {
		const $firestore = get(firestore);
		const $user = get(user);
		if (!$firestore || !$user) {
			return;
		}

		await setDoc(doc($firestore, `users/${$user.uid}`), { filter }, { merge: true });
	};

	const resetFilter = async () => {
		await setFilter(defaultFilter);
	};

	const isFiltering = (filter: Filter) => filter.types.length > 0 || filter.listened !== null;

	return {
		subscribe: rawFilterStore.subscribe,
		set: setFilter,
		reset: resetFilter,
		isFiltering
	};
}

export const filter = createFilter();
