// Inspired by https://github.com/CaptainCodeman/sveltekit-example/blob/master/src/lib/auth.ts & https://www.captaincodeman.com/lazy-loading-firebase-with-sveltekit / https://www.captaincodeman.com/lazy-loading-and-querying-firestore-with-sveltekit

import { derived, type Readable } from 'svelte/store';
import type { AppCheck } from '@firebase/app-check';
import type { FirebaseApp } from '@firebase/app';
import { app } from './app';
import {
	PUBLIC_FIREBASE_APPCHECK_DEBUG_TOKEN,
	PUBLIC_FIREBASE_USE_EMULATORS,
	PUBLIC_RECAPTCHA_SITE_KEY
} from '$env/static/public';

const createAppCheck = () => {
	let appCheck: AppCheck | undefined = undefined;

	const { subscribe } = derived<Readable<FirebaseApp>, AppCheck>(app, ($app, set) => {
		async function init() {
			if (!$app || appCheck) {
				return;
			}

			const { initializeAppCheck, ReCaptchaEnterpriseProvider } =
				await import('firebase/app-check');

			if (PUBLIC_FIREBASE_USE_EMULATORS === 'true') {
				self.FIREBASE_APPCHECK_DEBUG_TOKEN = PUBLIC_FIREBASE_APPCHECK_DEBUG_TOKEN;
			}

			appCheck = initializeAppCheck($app, {
				provider: new ReCaptchaEnterpriseProvider(PUBLIC_RECAPTCHA_SITE_KEY),
				isTokenAutoRefreshEnabled: true
			});

			set(appCheck);
		}

		init();
	});

	return {
		subscribe
	};
};

export const appCheck = createAppCheck();
