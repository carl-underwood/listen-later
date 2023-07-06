import { expect, test } from '@playwright/test';
import { v4 as uuid } from 'uuid';

test.describe('list page', () => {
	test('shows a button to add an item when signed in', async ({ page }) => {
		await page.goto('/list');
		const signInButton = page.getByRole('button', { name: 'Sign in anonymously' });
		await expect(signInButton).toBeVisible();
		await signInButton.click();

		const addItemButton = page.getByRole('link', { name: 'Add item' });
		await expect(addItemButton).toBeVisible();
		await expect(addItemButton).toHaveAttribute('href', '/list/add');
	});

	test('allows an item to be added when signed in', async ({ page }) => {
		await page.goto('/list');
		const signInButton = page.getByRole('button', { name: 'Sign in anonymously' });
		await expect(signInButton).toBeVisible();
		await signInButton.click();

		const addItemButton = page.getByRole('link', { name: 'Add item' });
		await expect(addItemButton).toBeVisible();
		await addItemButton.click();

		const idInput = page.getByLabel('id');
		await expect(idInput).toBeVisible();

		const id = uuid();
		await idInput.fill(id);

		const addButton = page.getByRole('button', { name: 'Add' });
		await expect(addButton).toBeVisible();
		await addButton.click();

		await page.waitForURL('/list');

		const newItem = page.getByText(id);
		await expect(newItem).toBeVisible();
	});

	test('allows an item to be added when signed in directly to the add page', async ({ page }) => {
		await page.goto('/list/add');
		const signInButton = page.getByRole('button', { name: 'Sign in anonymously' });
		await expect(signInButton).toBeVisible();
		await signInButton.click();

		const idInput = page.getByLabel('id');
		await expect(idInput).toBeVisible();

		const id = uuid();
		await idInput.fill(id);

		const addButton = page.getByRole('button', { name: 'Add' });
		await expect(addButton).toBeVisible();
		await addButton.click();

		await page.waitForURL('/list');

		const newItem = page.getByText(id);
		await expect(newItem).toBeVisible();
	});

	test('allows an item to be deleted when signed in', async ({ page }) => {
		await page.goto('/list');
		const signInButton = page.getByRole('button', { name: 'Sign in anonymously' });
		await expect(signInButton).toBeVisible();
		await signInButton.click();

		const addItemButton = page.getByRole('link', { name: 'Add item' });
		await expect(addItemButton).toBeVisible();
		await addItemButton.click();

		const idInput = page.getByLabel('id');
		await expect(idInput).toBeVisible();

		const id = uuid();
		await idInput.fill(id);

		const addButton = page.getByRole('button', { name: 'Add' });
		await expect(addButton).toBeVisible();
		await addButton.click();

		await page.waitForURL('/list');

		const newItem = page.getByRole('button', { name: id, exact: true });
		await expect(newItem).toBeVisible();

		const newItemDeleteButton = page.getByRole('button', { name: `Delete ${id}` });
		await expect(newItemDeleteButton).not.toBeVisible();

		await newItem.click();
		await expect(newItemDeleteButton).toBeVisible();
		await newItemDeleteButton.click();

		const confirmationPrompt = page.getByText(`Are you sure you want to delete ${id}?`);
		await expect(confirmationPrompt).toBeVisible();

		const deleteButton = page.getByRole('button', { name: 'Delete', exact: true });
		await expect(deleteButton).toBeVisible();
		await deleteButton.click();

		await expect(confirmationPrompt).not.toBeVisible();

		await expect(newItem).not.toBeVisible();
	});
});
