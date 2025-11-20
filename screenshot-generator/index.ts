import { join, dirname } from 'path';
import { test, devices, Page, expect } from '@playwright/test';
import {
	goToListPage,
	clickSignInWithGoogleButton,
	completeSignInWithGoogle,
	goToSearchPageAddItemAndVerify,
	autoGenerateOAuthUserDetails,
	expectListPageToBeVisible,
	clickAddItemButton,
	searchForAndSelectItem,
	getVisibleAddButton,
	waitForUrlWithSpotifyItemOpen
} from '../tests/helpers/shared';

// See https://flaviocopes.com/fix-dirname-not-defined-es-module-scope/
const __dirname = dirname(import.meta.url.replace('file://', ''));

test.use(devices['Pixel 5']);

test('generate screenshots', async ({ page }) => {
	await goToListPage(page);

	await clickSignInWithGoogleButton(page);
	await autoGenerateOAuthUserDetails(page);
	await completeSignInWithGoogle(page);
	await expectListPageToBeVisible(page);

	await goToSearchPageAddItemAndVerify(
		page,
		'Guz Khan & generational jazz rap',
		'0qUMjiIekImih3fAaF8B0H'
	);

	await goToSearchPageAddItemAndVerify(page, 'oreglo', '52ZhJRTVz14RYXJY9CTmkt');

	await clickAddItemButton(page);

	const name = 'Victory Dance';
	const id = '6GumLQysBiahvtJmxMXOpn';

	await searchForAndSelectItem(page, name, id);

	await takeScreenshot(page, 'search');

	const addButton = await getVisibleAddButton(page);
	await addButton.click();

	await waitForUrlWithSpotifyItemOpen(page, id);

	await expect(page.locator('.placeholder')).toHaveCount(0);

	await takeScreenshot(page, 'list');
});

const takeScreenshot = async (page: Page, name: string) => {
	const lightSwitch = page.getByLabel('Light Switch');
	const isLightMode = await lightSwitch.isChecked();
	await page.screenshot({
		path: join(__dirname, `../src/assets/${name}-${isLightMode ? 'light' : 'dark'}.png`),
		scale: 'css'
	});
	await lightSwitch.click();
	await page.waitForTimeout(500);
	await page.screenshot({
		path: join(__dirname, `../src/assets/${name}-${isLightMode ? 'dark' : 'light'}.png`),
		scale: 'css'
	});
};
