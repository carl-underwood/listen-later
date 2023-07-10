import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
	forbidOnly: !!process.env.CI,
	fullyParallel: true,
	projects: [
		{ name: 'Android', use: devices['Pixel 5'] },
		{ name: 'Desktop Chrome', use: devices['Desktop Chrome'] },
		{ name: 'Desktop Safari', use: devices['Desktop Safari'] },
		{ name: 'iOS', use: devices['iPhone 13'] }
	],
	reporter: [['html', { open: 'never' }]],
	testDir: 'tests',
	testMatch: /(.+\.)?(test|spec)\.[jt]s/,
	use: {
		trace: 'retain-on-failure',
		baseURL: 'http://localhost:5000/'
	},
	workers: process.env.CI ? 2 : undefined
});
