// Inspired by https://github.com/CaptainCodeman/sveltekit-example/blob/master/src/lib/auth.ts & https://www.captaincodeman.com/lazy-loading-firebase-with-sveltekit / https://www.captaincodeman.com/lazy-loading-and-querying-firestore-with-sveltekit

import { derived, type Readable } from 'svelte/store';
import { PUBLIC_FIREBASE_USE_EMULATORS } from '$env/static/public';
import type { FirebaseApp } from '@firebase/app';
import type { AppCheck } from '@firebase/app-check';
import type { Firestore } from '@firebase/firestore';
import { app } from './app';
import { appCheck } from './appCheck';

const createFirestore = () => {
	let firestore: Firestore | undefined = undefined;

	const { subscribe } = derived<[Readable<FirebaseApp>, Readable<AppCheck>], Firestore>(
		[app, appCheck],
		([$app, $appCheck], set) => {
			async function init() {
				if (!$app || !$appCheck || firestore) {
					return;
				}

				const { getFirestore, connectFirestoreEmulator } = await import('firebase/firestore');
				firestore = getFirestore($app);

				if (PUBLIC_FIREBASE_USE_EMULATORS === 'true') {
					connectFirestoreEmulator(firestore, 'localhost', 8080);
				}

				set(firestore);
			}

			init();
		}
	);

	return {
		subscribe
	};
};

export const firestore = createFirestore();
