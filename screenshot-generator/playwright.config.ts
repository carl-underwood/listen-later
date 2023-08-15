import { defineConfig } from '@playwright/test';

const millisecondsFromSeconds = (inputSeconds: number) => inputSeconds * 1000;

export default defineConfig({
	expect: {
		// Increased to account for functions emulator
		// cold start as well as hitting Spotify for real.
		timeout: millisecondsFromSeconds(20)
	},
	reporter: [['html', { open: 'never' }]],
	testMatch: /index\.ts/,
	use: {
		trace: 'retain-on-failure',
		baseURL: 'http://localhost:5000/'
	}
});
