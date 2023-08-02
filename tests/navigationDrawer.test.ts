import { expect, test } from '@playwright/test';

test.describe('navigation drawer', () => {
	test('shows the expected naviation items when not signed in', async ({ page }) => {
		await page.goto('/');

		await expect(async () => {
			const navDrawerButton = page.getByRole('button', { name: 'Open navigation' });
			await navDrawerButton.click();
			await expect(page.getByRole('dialog', { name: 'Navigation drawer' })).toBeVisible({
				timeout: 200
			});
		}).toPass();

		const homeNavigationItem = page.getByRole('link', { name: 'Home' });
		await expect(homeNavigationItem).toBeVisible();
		await expect(homeNavigationItem).toHaveAttribute('href', '/');

		const aboutNavigationItem = page.getByRole('link', { name: 'About' });
		await expect(aboutNavigationItem).toBeVisible();
		await expect(aboutNavigationItem).toHaveAttribute('href', '/about');

		const listNavigationItem = page.getByRole('link', { name: 'List' });
		await expect(listNavigationItem).toBeVisible();
		await expect(listNavigationItem).toHaveAttribute('href', '/list');

		const gitHubNavigationItem = page.getByRole('link', { name: 'GitHub' });
		await expect(gitHubNavigationItem).toBeVisible();
		await expect(gitHubNavigationItem).toHaveAttribute(
			'href',
			'https://github.com/carl-hartshorn/listen-later'
		);
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
		await expect(settingsNavigationItem).toHaveAttribute('href', '/list/settings');

		const signOutButton = page.getByRole('button', { name: 'Sign out' });
		await expect(signOutButton).toBeVisible();
		await signOutButton.click();

		await expect(signInButton).toBeVisible();
	});
});
