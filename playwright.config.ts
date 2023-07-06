import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
	forbidOnly: !!process.env.CI,
	fullyParallel: true,
	projects: [
		{ name: 'Android', use: devices['Pixel 5'] },
		{ name: 'Desktop Chrome', use: devices['Desktop Chrome'] },
		{ name: 'Desktop Safari', use: devices['Desktop Safari'] },
		{ name: 'IOS', use: devices['iPhone 13'] }
	],
	reporter: [['html', { open: 'never' }]],
	retries: process.env.CI ? 4 : 0,
	testDir: 'tests',
	testMatch: /(.+\.)?(test|spec)\.[jt]s/,
	webServer: {
		command: 'npm run dev',
		port: 5000,
		reuseExistingServer: true
	},
	workers: process.env.CI ? 2 : undefined
});
