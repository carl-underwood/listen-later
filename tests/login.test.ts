import { expect, test } from '@playwright/test';

test.describe('list page', () => {
	test('shows a button to sign in anonymously when not signed in', async ({ page }) => {
		await page.goto('/list');

		const button = page.getByRole('button', { name: 'Sign in anonymously' });
		await expect(button).toBeVisible();
		await button.click();

		await expect(page.getByRole('heading', { name: 'List' })).toBeVisible();
	});

	test('shows a navigation item for settings and button to sign out in the navigation drawer when signed in', async ({
		page
	}) => {
		await page.goto('/list');
		const signInButton = page.getByRole('button', { name: 'Sign in anonymously' });
		await expect(signInButton).toBeVisible();
		await signInButton.click();

		const navigationDrawerButton = page.getByRole('button', { name: 'Open navigation' });
		await navigationDrawerButton.click();

		const settingsNavigationItem = page.getByRole('link', { name: 'Settings' });
		await expect(settingsNavigationItem).toBeVisible();
		await expect(settingsNavigationItem).toHaveAttribute('href', '/settings');

		const signOutButton = page.getByRole('button', { name: 'Sign out' });
		await expect(signOutButton).toBeVisible();
		await signOutButton.click();

		await expect(signInButton).toBeVisible();
	});
});
