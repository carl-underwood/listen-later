import { expect, type APIRequestContext, type Locator, type Page } from '@playwright/test';
import retreiveMostRecentOobCode from './retrieveMostRecentOobCode';

export const expectNavigationItem = async (locator: Locator, name: string, href: string) => {
	const navigationItem = locator.getByRole('link', { name });
	await expect(navigationItem).toBeVisible();
	await expect(navigationItem).toHaveAttribute('href', href);
};

export const goToListPage = (page: Page) => page.goto('/list');

const clickSignInButton = async (
	page: Page,
	type: 'anonymously' | 'with Email' | 'with Google'
) => {
	const signInButton = page.getByRole('button', {
		name: type === 'anonymously' ? 'Try it out' : `Sign in ${type}`
	});
	await expect(signInButton).toBeVisible();
	await signInButton.click();
	return signInButton;
};

export const signInAnonymously = (page: Page) => clickSignInButton(page, 'anonymously');

export const clickSignInWithEmailButton = (page: Page) => clickSignInButton(page, 'with Email');

export const fillEmailInputClickSendSignInLinkAndExpectConfirmation = async (
	page: Page,
	email: string
) => {
	const emailInput = page.getByLabel('Email');
	await expect(emailInput).toBeVisible();
	await emailInput.fill(email);

	const sendSignInLinkButton = page.getByRole('button', { name: 'Send sign in link' });
	await expect(sendSignInLinkButton).toBeVisible();
	await sendSignInLinkButton.click();

	await expect(
		page.getByText('Email sent, please check your inbox for a sign in link')
	).toBeVisible();
};

export const retreiveMostRecentOobCodeAndGoTo = async (
	email: string,
	request: APIRequestContext,
	page: Page
) => {
	const oobCode = await retreiveMostRecentOobCode(email, request);

	await page.goto(oobCode.oobLink);
};

export const clickSignInWithGoogleButton = (page: Page) => clickSignInButton(page, 'with Google');

export const clickAddOAuthAccountButton = async (page: Page) => {
	const addNewAccountButton = page.getByRole('button', { name: 'Add new account' });
	await expect(addNewAccountButton).toBeVisible();
	await addNewAccountButton.click();
};

export const autoGenerateOAuthUserDetails = (page: Page) =>
	expect(async () => {
		await clickAddOAuthAccountButton(page);

		const autoGenerateUserInformationButton = page.getByRole('button', {
			name: 'Auto-generate user information'
		});
		await expect(autoGenerateUserInformationButton).toBeVisible();
		await autoGenerateUserInformationButton.click();
	}).toPass();

const getAuthEmulatorEmailInput = async (page: Page) => {
	const authEmulatorEmailInput = page.locator('[id="email-input"]');
	await expect(authEmulatorEmailInput).toBeVisible();
	return authEmulatorEmailInput;
};

export const getOAuthUserEmail = async (page: Page) => {
	const authEmulatorEmailInput = await getAuthEmulatorEmailInput(page);
	return await authEmulatorEmailInput.inputValue();
};

export const fillOAuthUserEmail = (page: Page, email: string) =>
	expect(async () => {
		await clickAddOAuthAccountButton(page);

		const authEmulatorEmailInput = await getAuthEmulatorEmailInput(page);
		await authEmulatorEmailInput.fill(email);
	}).toPass();

export const signInAsExistingOAuthUser = (page: Page, email: string) =>
	page.getByText(email).click();

const completeSignInWith = async (page: Page, oAuthProvider: 'Google') => {
	const signInWithOAuthProviderButton = page.getByRole('button', {
		name: `Sign in with ${oAuthProvider}.com`
	});
	await expect(signInWithOAuthProviderButton).toBeVisible();
	await signInWithOAuthProviderButton.click();
};

export const completeSignInWithGoogle = (page: Page) => completeSignInWith(page, 'Google');

export const expectListPageToBeVisible = (page: Page) =>
	expect(page.getByRole('heading', { name: 'List' })).toBeVisible();

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

const getVisibleSubmitSearchButton = async (page: Page) => {
	const searchButton = page.getByRole('button', { name: 'Submit' });
	await expect(searchButton).toBeVisible();
	return searchButton;
};

export const clickSubmitSearchButton = async (page: Page) => {
	const searchButton = await getVisibleSubmitSearchButton(page);
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

export const goToSearchPageAddItemAndVerify = async (page: Page, name: string, id: string) => {
	await clickAddItemButton(page);

	return await searchForItemAddAndVerify(page, name, id);
};

export const waitForUrlWithSpotifyItemOpen = (page: Page, spotifyId: string) =>
	page.waitForURL(`/list?itemId=spotify:${spotifyId}`);

export const openNavigation = async (page: Page) => {
	const openNavigationDrawerButton = page.getByRole('button', { name: 'Open navigation' });
	await openNavigationDrawerButton.click();
};

export const clickSignOutButton = async (page: Page) => {
	const signOutButton = page.getByRole('button', { name: 'Sign out' });
	await expect(signOutButton).toBeVisible();
	await signOutButton.click();
};

export const closeNavigation = async (page: Page) => {
	const closeNavigationDrawerButton = page.getByRole('button', { name: 'Close navigation' });
	await closeNavigationDrawerButton.click();
};

export const getVisibleItemWithName = async (
	page: Page,
	name: string,
	options?: { expanded?: boolean }
) => {
	const optionsWithDefaults = { expanded: true, ...options };

	const newItem = page.getByRole('button', {
		name,
		expanded: optionsWithDefaults.expanded
	});

	await expect(newItem).toBeVisible();

	return newItem;
};

export const searchForAndSelectItem = async (page: Page, name: string, id: string) => {
	await fillSearchInput(page, name);

	await expect(async () => {
		const searchButton = await getVisibleSubmitSearchButton(page);
		await clickSubmitSearchButton(page);

		await expect(searchButton).not.toBeDisabled();

		const errorAlert = page.getByRole('alert').filter({
			hasText: 'There was an error when fetching search results, please try again'
		});
		await expect(errorAlert).not.toBeVisible();

		await selectOptionWithId(page, id);
	}).toPass();
};

export const searchForItemAddAndVerify = async (page: Page, name: string, id: string) => {
	await searchForAndSelectItem(page, name, id);

	const addButton = await getVisibleAddButton(page);
	await addButton.click();

	await waitForUrlWithSpotifyItemOpen(page, id);

	return await getVisibleItemWithName(page, name);
};

export const signInAddItemAndVerify = async (page: Page, name: string, id: string) => {
	await goToListPage(page);
	await signInAnonymously(page);

	return await goToSearchPageAddItemAndVerify(page, name, id);
};

export const signInAddItemAndExpectMetadata = async (
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

export const expectAndConfirmDeletionConfirmation = async (page: Page) => {
	const confirmationPrompt = getDeletionConfirmationPrompt(page);
	await expect(confirmationPrompt).toBeVisible();

	const deleteButton = page.getByRole('button', { name: 'Delete', exact: true });
	await expect(deleteButton).toBeVisible();
	await deleteButton.click();
};

export const deleteAccount = async (page: Page) => {
	const openNavigationDrawerButton = page.getByRole('button', { name: 'Open navigation' });
	await openNavigationDrawerButton.click();

	const settingsLink = page.getByRole('link', { name: 'Settings' });
	await expect(settingsLink).toBeVisible();
	await settingsLink.click();

	await page.waitForURL('/list/settings');

	const deleteAccountButton = page.getByRole('button', { name: 'Delete account' });
	await expect(deleteAccountButton).toBeVisible();
	await deleteAccountButton.click();

	await expectAndConfirmDeletionConfirmation(page);
};

export const getDeletionConfirmationPrompt = (page: Page) =>
	page.getByText('Are you sure you want to delete your account?');

export const ensureLoggedOutAndConfirmationModalClosed = async (
	page: Page,
	signInButton: Locator
) => {
	await page.waitForURL('/list');
	await expect(signInButton).toBeVisible();
	const confirmationPrompt = getDeletionConfirmationPrompt(page);
	await expect(confirmationPrompt).not.toBeVisible();
};

export const getPromoteAccountAlert = (page: Page) =>
	page.getByRole('alert').filter({ hasText: 'Sign in to keep your list' });

export const addItemAndExpectPromoteAccountAlert = async (page: Page) => {
	const promoteAccountAlert = getPromoteAccountAlert(page);
	await expect(promoteAccountAlert).not.toBeVisible();

	const name = 'Victory Dance';
	const id = '6GumLQysBiahvtJmxMXOpn';
	await goToSearchPageAddItemAndVerify(page, name, id);

	await expect(promoteAccountAlert).toBeVisible();
	return { promoteAccountAlert, name };
};

export const expectPromoteAccountAlertDialog = async (page: Page) => {
	const promoteAccountDialog = page.getByTestId('modal-component').locator('div').first();
	await expect(promoteAccountDialog).toBeVisible();
	return promoteAccountDialog;
};

export const clickSignInAndExpectPromoteAccountAlertDialog = async (
	page: Page,
	promoteAccountAlert: Locator,
	signInButtonRole: 'link' | 'button' = 'link'
) => {
	const promoteAccountButton = promoteAccountAlert.getByRole(signInButtonRole, { name: 'Sign in' });
	await expect(promoteAccountButton).toBeVisible();
	await promoteAccountButton.click();
	await page.waitForURL('/list/settings?promoteAccount=true');

	return await expectPromoteAccountAlertDialog(page);
};

export const closeModal = (page: Page) =>
	page.getByTestId('modal-backdrop').click({ position: { x: 10, y: 10 } });
