// Inspired by https://github.com/CaptainCodeman/sveltekit-example/blob/master/src/lib/auth.ts & https://www.captaincodeman.com/lazy-loading-firebase-with-sveltekit

import { derived, type Readable } from 'svelte/store';
import type { Auth, User } from 'firebase/auth';
import { auth } from './auth';

const createUser = () => {
	const { subscribe } = derived<Readable<Auth>, User | null>(auth, ($auth, set) => {
		let unsubscribe = () => {
			return;
		};

		async function init() {
			if (!$auth) {
				return;
			}

			const { onAuthStateChanged } = await import('firebase/auth');

			unsubscribe = onAuthStateChanged($auth, (user) => {
				if (!auth) {
					return;
				}

				set(user);
			});
		}

		init();
		return unsubscribe;
	});

	return {
		subscribe
	};
};

export const user = createUser();
