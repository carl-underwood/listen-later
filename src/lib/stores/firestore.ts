// Inspired by https://github.com/CaptainCodeman/sveltekit-example/blob/master/src/lib/auth.ts & https://www.captaincodeman.com/lazy-loading-firebase-with-sveltekit / https://www.captaincodeman.com/lazy-loading-and-querying-firestore-with-sveltekit

import { derived, type Readable } from 'svelte/store';
import { PUBLIC_FIREBASE_USE_EMULATORS } from '$env/static/public';
import type { Firestore } from '@firebase/firestore';
import type { FirebaseApp } from '@firebase/app';
import { app } from './app';

const createFirestore = () => {
	let firestore: Firestore | undefined = undefined;

	const { subscribe } = derived<Readable<FirebaseApp>, Firestore>(app, ($app, set) => {
		async function init() {
			if (!$app || firestore) {
				return;
			}

			const { getFirestore, connectFirestoreEmulator } = await import('firebase/firestore');
			firestore = getFirestore($app);

			if (PUBLIC_FIREBASE_USE_EMULATORS) {
				connectFirestoreEmulator(firestore, 'localhost', 8080);
			}

			set(firestore);
		}

		init();
	});

	return {
		subscribe
	};
};

export const firestore = createFirestore();
