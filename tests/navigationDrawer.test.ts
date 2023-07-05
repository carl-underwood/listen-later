import { expect, test } from '@playwright/test';

test.describe('navigation drawer', () => {
	test('shows the expected naviation items when not signed in', async ({ page }) => {
		await page.goto('/');

		await expect(async () => {
			const navDrawerButtonLocator = page.getByRole('button', { name: 'Open navigation' });
			await navDrawerButtonLocator.click();
			await expect(page.getByRole('dialog', { name: 'Navigation drawer' })).toBeVisible({
				timeout: 200
			});
		}).toPass();

		const homeNavigationItemLocator = page.getByRole('link', { name: 'Home' });
		await expect(homeNavigationItemLocator).toBeVisible();
		await expect(homeNavigationItemLocator).toHaveAttribute('href', '/');

		const aboutNavigationItemLocator = page.getByRole('link', { name: 'About' });
		await expect(aboutNavigationItemLocator).toBeVisible();
		await expect(aboutNavigationItemLocator).toHaveAttribute('href', '/about');

		const listNavigationItemLocator = page.getByRole('link', { name: 'List' });
		await expect(listNavigationItemLocator).toBeVisible();
		await expect(listNavigationItemLocator).toHaveAttribute('href', '/list');

		const gitHubNavigationItemLocator = page.getByRole('link', { name: 'GitHub' });
		await expect(gitHubNavigationItemLocator).toBeVisible();
		await expect(gitHubNavigationItemLocator).toHaveAttribute(
			'href',
			'https://github.com/carl-hartshorn/listen-later'
		);
	});
});
