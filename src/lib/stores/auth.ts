// Inspired by https://github.com/CaptainCodeman/sveltekit-example/blob/master/src/lib/auth.ts & https://www.captaincodeman.com/lazy-loading-firebase-with-sveltekit

import { derived, type Readable } from 'svelte/store';
import { dev } from '$app/environment';
import type { Auth } from 'firebase/auth';
import type { FirebaseApp } from 'firebase/app';
import { app } from './app';

const createAuth = () => {
	let auth: Auth | undefined = undefined;

	const { subscribe } = derived<Readable<FirebaseApp>, Auth>(app, ($app, set) => {
		async function init() {
			if (!$app || auth) {
				return;
			}

			const { getAuth, connectAuthEmulator } = await import('firebase/auth');
			auth = getAuth($app);

			if (dev) {
				connectAuthEmulator(auth, 'http://localhost:9099');
			}

			set(auth);
		}

		init();
	});

	async function signOut() {
		if (!auth) {
			return;
		}

		const { signOut } = await import('firebase/auth');
		await signOut(auth);
	}

	return {
		subscribe,
		signOut,
		signInAnonymously: async () => {
			if (!auth) {
				return;
			}

			const { signInAnonymously } = await import('firebase/auth');

			await signInAnonymously(auth);
		}
	};
};

export const auth = createAuth();
