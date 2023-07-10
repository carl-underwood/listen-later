// Inspired by https://github.com/CaptainCodeman/sveltekit-example/blob/master/src/lib/auth.ts & https://www.captaincodeman.com/lazy-loading-firebase-with-sveltekit / https://www.captaincodeman.com/lazy-loading-and-querying-firestore-with-sveltekit

import { derived, type Readable } from 'svelte/store';
import { PUBLIC_FIREBASE_USE_EMULATORS } from '$env/static/public';
import type { Functions } from '@firebase/functions';
import type { FirebaseApp } from '@firebase/app';
import { app } from './app';

const createFunctions = () => {
	let functions: Functions | undefined = undefined;

	const { subscribe } = derived<Readable<FirebaseApp>, Functions>(app, ($app, set) => {
		async function init() {
			if (!$app || functions) {
				return;
			}

			const { getFunctions, connectFunctionsEmulator } = await import('firebase/functions');
			functions = getFunctions($app);

			if (PUBLIC_FIREBASE_USE_EMULATORS) {
				connectFunctionsEmulator(functions, 'localhost', 5001);
			}

			set(functions);
		}

		init();
	});

	return {
		subscribe
	};
};

export const functions = createFunctions();
