import { expect, test } from '@playwright/test';
import {
	expectNavigationItem,
	goToListPage,
	openNavigation,
	signInAnonymously
} from './helpers/shared';

test.describe('navigation drawer', () => {
	test('shows the expected naviation items when not signed in', async ({ page }) => {
		await page.goto('/');

		await expect(async () => {
			await openNavigation(page);

			await expect(page.getByRole('dialog', { name: 'Navigation drawer' })).toBeVisible({
				timeout: 200
			});
		}).toPass();

		await expectNavigationItem(page, 'Home', '/');
		await expectNavigationItem(page, 'About', '/about');
		await expectNavigationItem(page, 'List', '/list');
		await expectNavigationItem(page, 'GitHub', 'https://github.com/carl-hartshorn/listen-later');
	});

	test('shows a navigation item for settings and button to sign out in the navigation drawer when signed in', async ({
		page
	}) => {
		await goToListPage(page);
		await signInAnonymously(page);

		await openNavigation(page);
		await expectNavigationItem(page, 'Settings', '/list/settings');
	});
});
