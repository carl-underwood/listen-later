import { expect, test } from '@playwright/test';

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

		const searchInput = page.getByLabel('search');
		await expect(searchInput).toBeVisible();

		const id = '6cQzmvrbnCM1d51XOodmPR';
		await searchInput.fill('Victory Dance');

		const options = page.getByRole('option');
		await expect(options).toHaveCount(0);

		const searchButton = page.getByRole('button', { name: 'Submit' });
		await expect(searchButton).toBeVisible();
		await searchButton.click();

		await expect(options).not.toHaveCount(0);

		const addButton = page.getByRole('button', { name: 'Add', exact: true });
		await expect(addButton).toBeVisible();
		await expect(addButton).toBeDisabled();

		const expectedOption = page.locator(`[id="${id}"]`);
		await expect(expectedOption).toBeVisible();
		await expectedOption.click();

		await expect(addButton).not.toBeDisabled();

		// Hide the emulator warning as it covers the button
		await page.addStyleTag({ content: '.firebase-emulator-warning { display: none!important; }' });
		await addButton.click();

		await page.waitForURL('/list');

		const newItem = page.getByText('Victory Dance');
		await expect(newItem).toBeVisible();
	});

	test('allows an item to be added when signed in directly to the add page', async ({ page }) => {
		await page.goto('/list/add');
		const signInButton = page.getByRole('button', { name: 'Sign in anonymously' });
		await expect(signInButton).toBeVisible();
		await signInButton.click();

		const searchInput = page.getByLabel('search');
		await expect(searchInput).toBeVisible();

		const id = '6cQzmvrbnCM1d51XOodmPR';
		await searchInput.fill('Victory Dance');

		const options = page.getByRole('option');
		await expect(options).toHaveCount(0);

		const searchButton = page.getByRole('button', { name: 'Submit' });
		await expect(searchButton).toBeVisible();
		await searchButton.click();

		await expect(options).not.toHaveCount(0);

		const addButton = page.getByRole('button', { name: 'Add', exact: true });
		await expect(addButton).toBeVisible();
		await expect(addButton).toBeDisabled();

		const expectedOption = page.locator(`[id="${id}"]`);
		await expect(expectedOption).toBeVisible();
		await expectedOption.click();

		await expect(addButton).not.toBeDisabled();

		// Hide the emulator warning as it covers the button
		await page.addStyleTag({ content: '.firebase-emulator-warning { display: none!important; }' });
		await addButton.click();

		await page.waitForURL('/list');

		const newItem = page.getByText('Victory Dance');
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

		const searchInput = page.getByLabel('search');
		await expect(searchInput).toBeVisible();

		const id = '6cQzmvrbnCM1d51XOodmPR';
		await searchInput.fill('Victory Dance');

		const options = page.getByRole('option');
		await expect(options).toHaveCount(0);

		const searchButton = page.getByRole('button', { name: 'Submit' });
		await expect(searchButton).toBeVisible();
		await searchButton.click();

		await expect(options).not.toHaveCount(0);

		const addButton = page.getByRole('button', { name: 'Add', exact: true });
		await expect(addButton).toBeVisible();
		await expect(addButton).toBeDisabled();

		const expectedOption = page.locator(`[id="${id}"]`);
		await expect(expectedOption).toBeVisible();
		await expectedOption.click();

		await expect(addButton).not.toBeDisabled();

		// Hide the emulator warning as it covers the button
		await page.addStyleTag({ content: '.firebase-emulator-warning { display: none!important; }' });
		await addButton.click();

		await page.waitForURL('/list');

		const newItem = page.getByRole('button', { name: 'Victory Dance' });
		await expect(newItem).toBeVisible();

		const newItemDeleteButton = page.getByRole('button', { name: 'Delete Victory Dance' });
		await expect(newItemDeleteButton).not.toBeVisible();

		await newItem.click();
		await expect(newItemDeleteButton).toBeVisible();
		await newItemDeleteButton.click();

		const confirmationPrompt = page.getByText('Are you sure you want to delete Victory Dance?');
		await expect(confirmationPrompt).toBeVisible();

		const deleteButton = page.getByRole('button', { name: 'Delete', exact: true });
		await expect(deleteButton).toBeVisible();
		await deleteButton.click();

		await expect(confirmationPrompt).not.toBeVisible();

		await expect(newItem).not.toBeVisible();
	});
});
