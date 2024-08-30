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

		const navigationDrawer = page.getByRole('dialog', { name: 'Navigation drawer' });

		await expect(async () => {
			await openNavigation(page);

			await expect(navigationDrawer).toBeVisible({
				timeout: 200
			});
		}).toPass();

		await expectNavigationItem(navigationDrawer, 'Home', '/');
		await expectNavigationItem(navigationDrawer, 'List', '/list');
		await expectNavigationItem(
			navigationDrawer,
			'GitHub',
			'https://github.com/carl-hartshorn/listen-later'
		);
	});

	test('shows a navigation item for settings and button to sign out in the navigation drawer when signed in', async ({
		page
	}) => {
		await goToListPage(page);
		await signInAnonymously(page);

		await openNavigation(page);
		await expectNavigationItem(
			page.getByRole('dialog', { name: 'Navigation drawer' }),
			'Settings',
			'/list/settings'
		);
	});
});
