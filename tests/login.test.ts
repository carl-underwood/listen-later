import { expect, test } from '@playwright/test';

test.describe('list page', () => {
	test('shows a button to sign in anonymously when not signed in', async ({ page }) => {
		await page.goto('/list');

		const buttonLocator = page.getByRole('button', { name: 'Sign in anonymously' });
		await expect(buttonLocator).toBeVisible();
		await buttonLocator.click();

		await expect(page.getByRole('heading', { name: 'List' })).toBeVisible();
	});

	test('shows a navigation item for settings and button to sign out in the navigation drawer when signed in', async ({
		page
	}) => {
		await page.goto('/list');
		const signInButtonLocator = page.getByRole('button', { name: 'Sign in anonymously' });
		await expect(signInButtonLocator).toBeVisible();
		await signInButtonLocator.click();

		const navigationDrawerButtonLocator = page.getByRole('button', { name: 'Open navigation' });
		await navigationDrawerButtonLocator.click();

		const settingsNavigationItemLocator = page.getByRole('link', { name: 'Settings' });
		await expect(settingsNavigationItemLocator).toBeVisible();
		await expect(settingsNavigationItemLocator).toHaveAttribute('href', '/settings');

		const signOutButtonLocator = page.getByRole('button', { name: 'Sign out' });
		await expect(signOutButtonLocator).toBeVisible();
		await signOutButtonLocator.click();

		await expect(signInButtonLocator).toBeVisible();
	});
});
