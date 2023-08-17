import { defineConfig, devices } from '@playwright/test';

const millisecondsFromSeconds = (inputSeconds: number) => inputSeconds * 1000;

export default defineConfig({
	// Increased to account for functions emulator
	// cold start as well as hitting Spotify for real.
	timeout: millisecondsFromSeconds(60),
	expect: {
		// Increased to account for functions emulator
		// cold start as well as hitting Spotify for real.
		timeout: millisecondsFromSeconds(20)
	},
	forbidOnly: !!process.env.CI,
	fullyParallel: true,
	projects: [{ name: 'Android', use: devices['Pixel 5'] }],
	reporter: [['html', { open: 'never' }]],
	testMatch: /(.+\.)?(test|spec)\.[jt]s/,
	use: {
		trace: 'retain-on-failure',
		baseURL: 'https://listenlater.cloud/'
	}
});
