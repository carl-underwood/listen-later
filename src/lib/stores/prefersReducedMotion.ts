// From: https://geoffrich.net/posts/svelte-prefers-reduced-motion-store/

import { readable } from 'svelte/store';
import { browser } from '$app/environment';

const reducedMotionQuery = '(prefers-reduced-motion: reduce)';

const getInitialMotionPreference = () => browser && window.matchMedia(reducedMotionQuery).matches;

export const prefersReducedMotion = readable(getInitialMotionPreference(), (set) => {
	if (!browser) {
		return;
	}

	const updateMotionPreference = (event: MediaQueryListEvent) => {
		set(event.matches);
		console.log(event);
	};

	const mediaQueryList = window.matchMedia(reducedMotionQuery);
	mediaQueryList.addEventListener('change', updateMotionPreference);

	return () => {
		mediaQueryList.removeEventListener('change', updateMotionPreference);
	};
});
