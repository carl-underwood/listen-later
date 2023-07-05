import { expect, test } from '@playwright/test';

test.describe('list page', () => {
	test('shows a button to add an item when signed in', async ({ page }) => {
		await page.goto('/list');
		const signInButtonLocator = page.getByRole('button', { name: 'Sign in anonymously' });
		await expect(signInButtonLocator).toBeVisible();
		await signInButtonLocator.click();

		const addItemButtonLocator = page.getByRole('link', { name: 'Add item' });
		await expect(addItemButtonLocator).toHaveAttribute('href', '/list/add');
	});
});
