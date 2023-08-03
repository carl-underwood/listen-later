import { expect, test, type Page, type Locator } from '@playwright/test';
import {
	signIn,
	getVisibleAddItemButton,
	clickAddItemButton,
	fillSearchInput,
	clickSubmitSearchButton,
	selectOptionWithId,
	getVisibleAddButton
} from './helpers/list';

test.describe('list page', () => {
	test('shows a button to add an item when signed in', async ({ page }) => {
		await page.goto('/list');
		await signIn(page);

		const addItemButton = await getVisibleAddItemButton(page);
		await expect(addItemButton).toHaveAttribute('href', '/list/add');
	});

	test('allows an item to be added when signed in', async ({ page }) => {
		await signInAddItemAndVerify(page, 'Victory Dance', '6cQzmvrbnCM1d51XOodmPR');
	});

	test('allows an item to be added when signed in directly to the add page', async ({ page }) => {
		await page.goto('/list/add');
		await signIn(page);
		await searchForItemAddAndVerify(page, 'Victory Dance', '6cQzmvrbnCM1d51XOodmPR');
	});

	test('allows an item to be deleted when signed in', async ({ page }) => {
		const newItem = await signInAddItemAndVerify(page, 'Victory Dance', '6cQzmvrbnCM1d51XOodmPR');

		const newItemDeleteButton = page.getByRole('button', { name: 'Delete Victory Dance' });
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
		const name = 'Victory Dance';
		const id = '6cQzmvrbnCM1d51XOodmPR';

		await signInAddItemAndVerify(page, name, id);

		const addedAt = page.getByText('Added less than a minute ago');
		await expect(addedAt).toBeVisible();
		const addedAtUtc = await addedAt.getAttribute('data-added-at-utc');

		await goToSearchPageAddItemAndVerify(page, name, id);

		await expect(addedAt).toBeVisible();
		expect(await addedAt.getAttribute('data-added-at-utc')).toBe(addedAtUtc);
	});

	test('expands the newly added item', async ({ page }) => {
		await signInAddItemAndVerify(page, 'Ezra Collective', '5BRAUN0yN8557PLRZIr02W');

		const newItem = await goToSearchPageAddItemAndVerify(
			page,
			'Victory Dance',
			'6cQzmvrbnCM1d51XOodmPR'
		);
		await expect(newItem).toBeVisible();
		await expect(newItem).toHaveAttribute('aria-expanded', 'true');
	});

	test('shows a button to open the item in Spotify', async ({ page }) => {
		const id = '6cQzmvrbnCM1d51XOodmPR';
		await signInAddItemAndVerify(page, 'Victory Dance', id);

		const openInSpotifyLink = page.getByRole('link', { name: 'Open in Spotify' });
		await expect(openInSpotifyLink).toBeVisible();
		await expect(openInSpotifyLink).toHaveAttribute(
			'href',
			`https://open.spotify.com/track/${id}?go=1`
		);
	});

	test('allows items to be marked as listened to', async ({ page }) => {
		const newItem = await signInAddItemAndVerify(page, 'Victory Dance', '6cQzmvrbnCM1d51XOodmPR');

		const listenedSwitch = page.getByRole('switch', { name: 'Listened' });
		const listenedSwitchUnderlyingCheckbox = listenedSwitch.locator("input[type='checkbox']");
		await expect(listenedSwitch).toBeVisible();
		await expect(listenedSwitch).not.toBeChecked();
		await listenedSwitch.click();
		await expect(listenedSwitch).toBeChecked();

		// Wait for the change to be persisted
		await expect(listenedSwitchUnderlyingCheckbox).not.toBeDisabled();

		await page.reload();

		await expect(newItem).toBeVisible();
		await expect(listenedSwitch).toBeVisible();
		await expect(listenedSwitch).toBeChecked();
	});

	test('shows metadata for song Spotify items', async ({ page }) => {
		await signInAddItemAndExpectMetadata(
			page,
			'Victory Dance',
			'5Nu4AvrNgIx42nWGbteHLh',
			async (newItem) => {
				await expect(newItem.getByText('Song')).toBeVisible();
				await expect(newItem.getByText('Ezra Collective')).toBeVisible();
				await expect(newItem.getByText("Where I'm Meant To Be")).toBeVisible();
			}
		);
	});

	test('shows metadata for album Spotify items', async ({ page }) => {
		await signInAddItemAndExpectMetadata(
			page,
			'Victory Dance',
			'7x5W5TIWobdV7SeF6kFtn9',
			async (newItem) => {
				await expect(newItem.getByText('Single')).toBeVisible();
				await expect(newItem.getByText('Ezra Collective')).toBeVisible();
			}
		);
	});

	test('shows metadata for artist Spotify items', async ({ page }) => {
		await signInAddItemAndExpectMetadata(
			page,
			'Ezra Collective',
			'5BRAUN0yN8557PLRZIr02W',
			async (newItem) => {
				await expect(newItem.getByText('Artist')).toBeVisible();
			}
		);
	});

	test('shows metadata for episode Spotify items', async ({ page }) => {
		await signInAddItemAndExpectMetadata(
			page,
			'Guz Khan & generational jazz rap',
			'0qUMjiIekImih3fAaF8B0H',
			async (newItem) => {
				await expect(newItem.getByText('Episode')).toBeVisible();
				await expect(newItem.getByText("James Acaster's Perfect Sounds")).toBeVisible();
			}
		);
	});

	test('shows metadata for podcast Spotify items', async ({ page }) => {
		await signInAddItemAndExpectMetadata(
			page,
			"James Acaster's Perfect Sounds",
			'5zR7VUlNzu7bHtEUnC2otn',
			async (newItem) => {
				await expect(newItem.getByText('Podcast')).toBeVisible();
			}
		);
	});
});

const goToSearchPageAddItemAndVerify = async (page: Page, name: string, id: string) => {
	await clickAddItemButton(page);

	return await searchForItemAddAndVerify(page, name, id);
};

const searchForItemAddAndVerify = async (page: Page, name: string, id: string) => {
	await fillSearchInput(page, name);
	await clickSubmitSearchButton(page);
	await selectOptionWithId(page, id);

	const addButton = await getVisibleAddButton(page);
	await addButton.click();

	await page.waitForURL(`/list?itemId=spotify:${id}`);

	const newItem = page.getByRole('button', {
		name,
		expanded: true
	});

	await expect(newItem).toBeVisible();

	return newItem;
};

const signInAddItemAndVerify = async (page: Page, name: string, id: string) => {
	await page.goto('/list');
	await signIn(page);

	return await goToSearchPageAddItemAndVerify(page, name, id);
};

const signInAddItemAndExpectMetadata = async (
	page: Page,
	name: string,
	id: string,
	expectMetadata: (newItem: Locator) => Promise<void>
) => {
	const newItem = await signInAddItemAndVerify(page, name, id);

	await expectMetadata(newItem);

	const itemImage = newItem.locator('img');
	await expect(itemImage).toHaveAttribute('src', /https:\/\/i\.scdn\.co\/image\/.+/);
	await expect(itemImage).toBeVisible();
};
