import { expect, test } from '@playwright/test';
import {
	signInAnonymously,
	getVisibleAddItemButton,
	signInAddItemAndExpectMetadata,
	goToSearchPageAddItemAndVerify,
	searchForItemAddAndVerify,
	signInAddItemAndVerify,
	goToListPage
} from './helpers/shared';

test.describe('list page', () => {
	test('shows a button to add an item when signed in', async ({ page }) => {
		await goToListPage(page);
		await signInAnonymously(page);

		const addItemButton = await getVisibleAddItemButton(page);
		await expect(addItemButton).toHaveAttribute('href', '/list/add');
	});

	test('allows an item to be added when signed in', async ({ page }) => {
		await signInAddItemAndVerify(page, 'Victory Dance', '6GumLQysBiahvtJmxMXOpn');
	});

	test('allows an item to be added when signed in directly to the add page', async ({ page }) => {
		await page.goto('/list/add');
		await signInAnonymously(page);
		await searchForItemAddAndVerify(page, 'Victory Dance', '6GumLQysBiahvtJmxMXOpn');
	});

	test('allows an item to be deleted when signed in', async ({ page }) => {
		const newItem = await signInAddItemAndVerify(page, 'Victory Dance', '6GumLQysBiahvtJmxMXOpn');

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
		const id = '6GumLQysBiahvtJmxMXOpn';

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
			'6GumLQysBiahvtJmxMXOpn'
		);
		await expect(newItem).toBeVisible();
		await expect(newItem).toHaveAttribute('aria-expanded', 'true');
	});

	test('shows a button to open the item in Spotify', async ({ page }) => {
		const id = '6GumLQysBiahvtJmxMXOpn';
		await signInAddItemAndVerify(page, 'Victory Dance', id);

		const openInSpotifyLink = page.getByRole('link', { name: 'Open in Spotify' });
		await expect(openInSpotifyLink).toBeVisible();
		await expect(openInSpotifyLink).toHaveAttribute(
			'href',
			`https://open.spotify.com/track/${id}?go=1`
		);
	});

	test('allows items to be marked as listened to', async ({ page }) => {
		const newItem = await signInAddItemAndVerify(page, 'Victory Dance', '6GumLQysBiahvtJmxMXOpn');

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
			'6GumLQysBiahvtJmxMXOpn',
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
			"Where I'm Meant To Be",
			'4bFZYpPPKHvsVsmYEYnIRk',
			async (newItem) => {
				await expect(newItem.getByText('Album')).toBeVisible();
				await expect(newItem.getByText('Ezra Collective')).toBeVisible();
			}
		);
	});

	test('shows metadata for album Spotify items (singles)', async ({ page }) => {
		await signInAddItemAndExpectMetadata(
			page,
			'God Gave Me Feet For Dancing (feat. Yazmin Lacey)',
			'6JcMpbDUIIigbqtymfNTUY',
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
