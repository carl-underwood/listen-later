import { expect, type Page } from '@playwright/test';

export const signIn = async (page: Page) => {
	const signInButton = page.getByRole('button', { name: 'Sign in anonymously' });
	await expect(signInButton).toBeVisible();
	await signInButton.click();
};

export const getVisibleAddItemButton = async (page: Page) => {
	const addItemButton = page.getByRole('link', { name: 'Add item' });
	await expect(addItemButton).toBeVisible();
	return addItemButton;
};

export const clickAddItemButton = async (page: Page) => {
	const addItemButton = await getVisibleAddItemButton(page);
	await addItemButton.click();
};

export const fillSearchInput = async (page: Page, searchQuery: string) => {
	const searchInput = page.getByLabel('search');
	await expect(searchInput).toBeVisible();

	await searchInput.fill(searchQuery);
};

export const clickSubmitSearchButton = async (page: Page) => {
	const searchButton = page.getByRole('button', { name: 'Submit' });
	await expect(searchButton).toBeVisible();
	await searchButton.click();
};

export const getVisibleAddButton = async (page: Page) => {
	const addButton = page.getByRole('button', { name: 'Add', exact: true });
	await expect(addButton).toBeVisible();
	return addButton;
};

export const selectOptionWithId = async (page: Page, id: string) => {
	const expectedOption = page.locator(`[id="${id}"]`);
	await expect(expectedOption).toBeVisible();
	await expectedOption.click();
};
