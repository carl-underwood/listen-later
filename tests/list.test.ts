import { expect, test, type Page } from '@playwright/test';

const hideEmulatorWarining = async (page: Page) => {
	await page.addStyleTag({ content: '.firebase-emulator-warning { display: none!important; }' });
};

const signIn = async (page: Page) => {
	const signInButton = page.getByRole('button', { name: 'Sign in anonymously' });
	await expect(signInButton).toBeVisible();
	await signInButton.click();
};

const getVisibleAddItemButton = async (page: Page) => {
	const addItemButton = page.getByRole('link', { name: 'Add item' });
	await expect(addItemButton).toBeVisible();
	return addItemButton;
};

const clickAddItemButton = async (page: Page) => {
	const addItemButton = await getVisibleAddItemButton(page);
	await addItemButton.click();
};

const fillSearchInput = async (page: Page, searchQuery: string) => {
	const searchInput = page.getByLabel('search');
	await expect(searchInput).toBeVisible();

	await searchInput.fill(searchQuery);
};

const clickSubmitSearchButton = async (page: Page) => {
	const searchButton = page.getByRole('button', { name: 'Submit' });
	await expect(searchButton).toBeVisible();
	await searchButton.click();
};

const getVisibleAddButton = async (page: Page) => {
	const addButton = page.getByRole('button', { name: 'Add', exact: true });
	await expect(addButton).toBeVisible();
	return addButton;
};

const selectOptionWithId = async (page: Page, id: string) => {
	const expectedOption = page.locator(`[id="${id}"]`);
	await expect(expectedOption).toBeVisible();
	await expectedOption.click();
};

test.describe('list page', () => {
	test('shows a button to add an item when signed in', async ({ page }) => {
		await page.goto('/list');
		await signIn(page);

		const addItemButton = await getVisibleAddItemButton(page);
		await expect(addItemButton).toHaveAttribute('href', '/list/add');
	});

	test('allows an item to be added when signed in', async ({ page }) => {
		await page.goto('/list');
		await signIn(page);

		await clickAddItemButton(page);

		const id = '6cQzmvrbnCM1d51XOodmPR';
		await fillSearchInput(page, 'Victory Dance');

		const options = page.getByRole('option');
		await expect(options).toHaveCount(0);

		await clickSubmitSearchButton(page);

		await expect(options).not.toHaveCount(0);

		const addButton = await getVisibleAddButton(page);
		await expect(addButton).toBeDisabled();

		await selectOptionWithId(page, id);

		await expect(addButton).not.toBeDisabled();

		// Hide the emulator warning as it covers the button
		await hideEmulatorWarining(page);
		await addButton.click();

		await page.waitForURL('/list');

		const newItem = page.getByText('Victory Dance');
		await expect(newItem).toBeVisible();
	});

	test('allows an item to be added when signed in directly to the add page', async ({ page }) => {
		await page.goto('/list/add');
		await signIn(page);

		const id = '6cQzmvrbnCM1d51XOodmPR';
		await fillSearchInput(page, 'Victory Dance');

		const options = page.getByRole('option');
		await expect(options).toHaveCount(0);

		await clickSubmitSearchButton(page);

		await expect(options).not.toHaveCount(0);

		const addButton = await getVisibleAddButton(page);
		await expect(addButton).toBeDisabled();

		await selectOptionWithId(page, id);

		await expect(addButton).not.toBeDisabled();

		// Hide the emulator warning as it covers the button
		await hideEmulatorWarining(page);
		await addButton.click();

		await page.waitForURL('/list');

		const newItem = page.getByText('Victory Dance');
		await expect(newItem).toBeVisible();
	});

	test('allows an item to be deleted when signed in', async ({ page }) => {
		await page.goto('/list');
		await signIn(page);

		await clickAddItemButton(page);

		const id = '6cQzmvrbnCM1d51XOodmPR';
		await fillSearchInput(page, 'Victory Dance');

		const options = page.getByRole('option');
		await expect(options).toHaveCount(0);

		await clickSubmitSearchButton(page);

		await expect(options).not.toHaveCount(0);

		const addButton = await getVisibleAddButton(page);
		await expect(addButton).toBeDisabled();

		await selectOptionWithId(page, id);

		await expect(addButton).not.toBeDisabled();

		// Hide the emulator warning as it covers the button
		await hideEmulatorWarining(page);
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

	test('prevents an item added again from overwriting the existing item', async ({ page }) => {
		await page.goto('/list');
		await signIn(page);

		await clickAddItemButton(page);

		const id = '6cQzmvrbnCM1d51XOodmPR';
		await fillSearchInput(page, 'Victory Dance');

		const firstSearchOptions = page.getByRole('option');
		await expect(firstSearchOptions).toHaveCount(0);

		await clickSubmitSearchButton(page);

		await expect(firstSearchOptions).not.toHaveCount(0);

		const addButton = await getVisibleAddButton(page);
		await expect(addButton).toBeDisabled();

		await selectOptionWithId(page, id);

		await expect(addButton).not.toBeDisabled();

		// Hide the emulator warning as it covers the button
		await hideEmulatorWarining(page);
		await addButton.click();

		await page.waitForURL('/list');

		const newItem = page.getByRole('button', { name: 'Victory Dance' });
		await expect(newItem).toBeVisible();
		await newItem.click();

		const addedAt = page.getByText('Added less than a minute ago');
		await expect(addedAt).toBeVisible();
		const addedAtUtc = await addedAt.getAttribute('data-added-at-utc');

		await clickAddItemButton(page);

		await fillSearchInput(page, 'Victory Dance');

		const secondSearchOptions = page.getByRole('option');
		await expect(secondSearchOptions).toHaveCount(0);

		await clickSubmitSearchButton(page);

		await expect(secondSearchOptions).not.toHaveCount(0);

		await expect(addButton).toBeDisabled();

		await selectOptionWithId(page, id);

		await expect(addButton).not.toBeDisabled();

		await addButton.click();

		await page.waitForURL('/list');

		const newItemDeleteButton = page.getByRole('button', { name: 'Delete Victory Dance' });
		await expect(newItemDeleteButton).not.toBeVisible();

		await newItem.click();
		await expect(addedAt).toBeVisible();
		expect(await addedAt.getAttribute('data-added-at-utc')).toBe(addedAtUtc);
	});
});
