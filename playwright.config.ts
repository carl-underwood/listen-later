import { defineConfig, devices } from '@playwright/test';

const millisecondsFromSeconds = (inputSeconds: number) => inputSeconds * 1000;

export default defineConfig({
	expect: {
		// Increased to account for functions emulator
		// cold start as well as hitting Spotify for real.
		timeout: millisecondsFromSeconds(20)
	},
	forbidOnly: !!process.env.CI,
	fullyParallel: true,
	projects: [
		{ name: 'Android', use: devices['Pixel 5'] },
		{ name: 'Desktop Chrome', use: devices['Desktop Chrome'] },
		{ name: 'Desktop Safari', use: devices['Desktop Safari'] },
		{ name: 'iOS', use: devices['iPhone 13'] }
	],
	reporter: [['html', { open: 'never' }]],
	retries: 1,
	testDir: 'tests',
	testMatch: /(.+\.)?(test|spec)\.[jt]s/,
	use: {
		trace: 'retain-on-failure',
		baseURL: 'http://localhost:5000/'
	},
	workers: process.env.CI ? 2 : 5
});
