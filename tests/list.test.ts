import { expect, test } from '@playwright/test';
import { v4 as uuid } from 'uuid';

test.describe('list page', () => {
	test('shows a button to add an item when signed in', async ({ page }) => {
		await page.goto('/list');
		const signInButtonLocator = page.getByRole('button', { name: 'Sign in anonymously' });
		await expect(signInButtonLocator).toBeVisible();
		await signInButtonLocator.click();

		const addItemButtonLocator = page.getByRole('link', { name: 'Add item' });
		await expect(addItemButtonLocator).toBeVisible();
		await expect(addItemButtonLocator).toHaveAttribute('href', '/list/add');
	});

	test('allows an item to be added when signed in', async ({ page }) => {
		await page.goto('/list');
		const signInButtonLocator = page.getByRole('button', { name: 'Sign in anonymously' });
		await expect(signInButtonLocator).toBeVisible();
		await signInButtonLocator.click();

		const addItemButtonLocator = page.getByRole('link', { name: 'Add item' });
		await expect(addItemButtonLocator).toBeVisible();
		await addItemButtonLocator.click();

		const idInputLocator = page.getByLabel('id');
		await expect(idInputLocator).toBeVisible();

		const id = uuid();
		await idInputLocator.fill(id);

		const addButtonLocator = page.getByRole('button', { name: 'Add' });
		await expect(addButtonLocator).toBeVisible();
		await addButtonLocator.click();

		await page.waitForURL('/list');

		const newItemLocator = page.getByText(id);
		await expect(newItemLocator).toBeVisible();
	});

	test('allows an item to be added when signed in directly to the add page', async ({ page }) => {
		await page.goto('/list/add');
		const signInButtonLocator = page.getByRole('button', { name: 'Sign in anonymously' });
		await expect(signInButtonLocator).toBeVisible();
		await signInButtonLocator.click();

		const idInputLocator = page.getByLabel('id');
		await expect(idInputLocator).toBeVisible();

		const id = uuid();
		await idInputLocator.fill(id);

		const addButtonLocator = page.getByRole('button', { name: 'Add' });
		await expect(addButtonLocator).toBeVisible();
		await addButtonLocator.click();

		await page.waitForURL('/list');

		const newItemLocator = page.getByText(id);
		await expect(newItemLocator).toBeVisible();
	});
});
