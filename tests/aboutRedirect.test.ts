import { expect, test } from '@playwright/test';

test.describe('about page redirect', () => {
	test('points to the home page (will fail with `npm run dev` - requires firebase hosting emulator)', async ({
		page
	}) => {
		await page.goto('/about');

		await expect(page).toHaveURL('/');
		await expect(page.getByRole('heading', { level: 1 })).toHaveText('Listen Later');
	});
});
