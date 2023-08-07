import { expect, test, type APIRequestContext, type Locator, type Page } from '@playwright/test';
import { v4 as uuid } from 'uuid';
import retreiveMostRecentOobCode from './helpers/retrieveMostRecentOobCode';
import { goToListPage, goToSearchPageAddItemAndVerify, signInAnonymously } from './helpers/shared';
import { initializeApp } from 'firebase-admin/app';
import { getAuth, type UserRecord } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { skipTestOnWebkit } from './helpers/skipTestOnWebkit';

process.env.FIREBASE_AUTH_EMULATOR_HOST = '127.0.0.1:9099';
process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080';
initializeApp({ projectId: 'listen-later-cloud' });
const auth = getAuth();
const firestore = getFirestore();

test.describe('settings page', () => {
	test('allows an anonymous account to be deleted', async ({ page }) => {
		await goToListPage(page);

		const signInButton = await signInAnonymously(page);

		await addSong(page);
		await deleteAccount(page);
		await ensureLoggedOutAndConfirmationModalClosed(page, signInButton);
	});

	test('allows an account using email to be deleted', async ({ page, request }) => {
		await goToListPage(page);

		const { email, signInButton, user } = await signInWithEmail(page, request);

		await addSong(page);
		await ensureSongHasBeenAdded(user.uid);
		await deleteAccount(page);
		await ensureLoggedOutAndConfirmationModalClosed(page, signInButton);
		await ensureUserAccountIsDeleted(email);
		await ensureUserItemsDeleted(user.uid);
	});

	test('allows an account using Sign in with Google to be deleted', async ({
		page,
		browserName
	}) => {
		skipTestOnWebkit(browserName);

		await goToListPage(page);

		const { email, signInButton, user } = await signInWithGoogle(page);

		await addSong(page);
		await ensureSongHasBeenAdded(user.uid);
		await deleteAccount(page);
		await ensureLoggedOutAndConfirmationModalClosed(page, signInButton);
		await ensureUserAccountIsDeleted(email);
		await ensureUserItemsDeleted(user.uid);
	});

	test('allows an account using Sign in with Apple to be deleted', async ({
		page,
		browserName
	}) => {
		skipTestOnWebkit(browserName);

		await goToListPage(page);

		const { email, signInButton, user } = await signInWithApple(page);

		await addSong(page);
		await ensureSongHasBeenAdded(user.uid);
		await deleteAccount(page);
		await ensureLoggedOutAndConfirmationModalClosed(page, signInButton);
		await ensureUserAccountIsDeleted(email);
		await ensureUserItemsDeleted(user.uid);
	});

	test('allows an account using email to be deleted following reauthentication', async ({
		page,
		request
	}) => {
		await goToListPage(page);

		const { email, signInButton, user } = await signInWithEmail(page, request);

		await addSong(page);
		await ensureSongHasBeenAdded(user.uid);
		await forceReauthenticationForAccountDeletion(page);
		await deleteAccount(page);
		await expectSendSignInLinkButtonAndClick(page);

		const reauthenticationOobCode = await retreiveMostRecentOobCode(email, request);

		await page.goto(reauthenticationOobCode.oobLink);

		await expectAndConfirmDeletionConfirmation(page);
		await ensureLoggedOutAndConfirmationModalClosed(page, signInButton);
		await ensureUserAccountIsDeleted(email);
		await ensureUserItemsDeleted(user.uid);
	});

	test('allows an account using email to be deleted following reauthentication in a different browser context', async ({
		browser,
		request
	}) => {
		const firstContext = await browser.newContext();
		const firstPage = await firstContext.newPage();

		await goToListPage(firstPage);

		const { email, user } = await signInWithEmail(firstPage, request);

		await addSong(firstPage);
		await ensureSongHasBeenAdded(user.uid);
		await forceReauthenticationForAccountDeletion(firstPage);
		await deleteAccount(firstPage);
		await expectSendSignInLinkButtonAndClick(firstPage);

		const reauthenticationOobCode = await retreiveMostRecentOobCode(email, request);

		const secondContext = await browser.newContext();
		const secondPage = await secondContext.newPage();
		await secondPage.goto(reauthenticationOobCode.oobLink);

		await expect(
			secondPage.getByText('Please confirm the email that received the sign in link')
		).toBeVisible();

		const emailConfirmationInput = secondPage.getByLabel('Email');
		await expect(emailConfirmationInput).toBeVisible();
		await emailConfirmationInput.fill(email);

		const signInButton = secondPage.getByRole('button', { name: 'Sign in' });
		await expect(signInButton).toBeVisible();
		await signInButton.click();

		await expectAndConfirmDeletionConfirmation(secondPage);
		const signInWithEmailButton = getSignInWithEmailButton(secondPage);
		await ensureLoggedOutAndConfirmationModalClosed(secondPage, signInWithEmailButton);
		await ensureUserAccountIsDeleted(email);
		await ensureUserItemsDeleted(user.uid);
	});

	test('allows an account using Sign in with Google to be deleted following reauthentication', async ({
		page,
		browserName
	}) => {
		skipTestOnWebkit(browserName);

		await goToListPage(page);

		const { email, signInButton, user } = await signInWithGoogle(page);

		await addSong(page);
		await ensureSongHasBeenAdded(user.uid);
		await forceReauthenticationForAccountDeletion(page);
		await deleteAccount(page);
		await expectSignInButtonAndSignInWithExistingAccount(page, signInButton, email);
		await expectAndConfirmDeletionConfirmation(page);
		await ensureLoggedOutAndConfirmationModalClosed(page, signInButton);
		await ensureUserAccountIsDeleted(email);
		await ensureUserItemsDeleted(user.uid);
	});

	test('allows an account using Sign in with Apple to be deleted following reauthentication', async ({
		page,
		browserName
	}) => {
		skipTestOnWebkit(browserName);

		await goToListPage(page);

		const { email, signInButton, user } = await signInWithApple(page);

		await addSong(page);
		await ensureSongHasBeenAdded(user.uid);
		await forceReauthenticationForAccountDeletion(page);
		await deleteAccount(page);
		await expectSignInButtonAndSignInWithExistingAccount(page, signInButton, email);
		await expectAndConfirmDeletionConfirmation(page);
		await ensureLoggedOutAndConfirmationModalClosed(page, signInButton);
		await ensureUserAccountIsDeleted(email);
		await ensureUserItemsDeleted(user.uid);
	});
});

const expectSendSignInLinkButtonAndClick = async (page: Page) => {
	const sendSignInLinkButton = page.getByRole('button', { name: 'Send sign in link' });
	await expect(sendSignInLinkButton).toBeVisible();
	await sendSignInLinkButton.click();

	await expect(
		page.getByText('Email sent, please check your inbox for a sign in link')
	).toBeVisible();
};

const getSignInWithEmailButton = (page: Page) =>
	page.getByRole('button', { name: 'Sign in with Email' });

const signInWithEmail = async (page: Page, request: APIRequestContext) => {
	const signInButton = getSignInWithEmailButton(page);
	await expect(signInButton).toBeVisible();
	await signInButton.click();

	const email = `${uuid()}@listenlater.cloud`;

	const emailInput = page.getByLabel('Email');
	await expect(emailInput).toBeVisible();
	await emailInput.fill(email);

	await expectSendSignInLinkButtonAndClick(page);

	const oobCode = await retreiveMostRecentOobCode(email, request);

	await page.goto(oobCode.oobLink);

	const user = await ensureUserIsCreated(email);
	return { email, signInButton, user };
};

const signInWithOAuthProvider = async (page: Page, oAuthProvider: 'Apple' | 'Google') => {
	const signInButton = page.getByRole('button', { name: `Sign in with ${oAuthProvider}` });
	await expect(signInButton).toBeVisible();
	await signInButton.click();

	await expect(async () => {
		const addNewAccountButton = page.getByRole('button', { name: 'Add new account' });
		await expect(addNewAccountButton).toBeVisible();
		await addNewAccountButton.click();

		const autoGenerateUserInformationButton = page.getByRole('button', {
			name: 'Auto-generate user information'
		});
		await expect(autoGenerateUserInformationButton).toBeVisible();
		await autoGenerateUserInformationButton.click();
	}).toPass();

	const authEmulatorEmailInput = page.locator('[id="email-input"]');
	await expect(authEmulatorEmailInput).toBeVisible();
	const email = await authEmulatorEmailInput.inputValue();

	const signInWithGoogleDotComButton = page.getByRole('button', {
		name: `Sign in with ${oAuthProvider}.com`
	});

	await expect(signInWithGoogleDotComButton).toBeVisible();
	await signInWithGoogleDotComButton.click();

	const user = await ensureUserIsCreated(email);
	return { email, signInButton, user };
};

const signInWithGoogle = (page: Page) => signInWithOAuthProvider(page, 'Google');
const signInWithApple = (page: Page) => signInWithOAuthProvider(page, 'Apple');

const ensureUserIsCreated = async (email: string) => {
	let user: UserRecord;

	await expect(async () => {
		user = await auth.getUserByEmail(email);
		expect(user).toBeTruthy();
		return user;
	}).toPass();

	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	return user!;
};

const addSong = async (page: Page) => {
	const name = 'Victory Dance';
	const id = '5Nu4AvrNgIx42nWGbteHLh';
	await goToSearchPageAddItemAndVerify(page, name, id);
};

const getDeletionConfirmationPrompt = (page: Page) =>
	page.getByText('Are you sure you want to delete your account?');

const ensureSongHasBeenAdded = async (userUid: string) => {
	await expect(async () => {
		const userItems = await firestore.collection(`users/${userUid}/items`).listDocuments();
		expect(userItems).toHaveLength(1);
	}).toPass();
};

const expectAndConfirmDeletionConfirmation = async (page: Page) => {
	const confirmationPrompt = getDeletionConfirmationPrompt(page);
	await expect(confirmationPrompt).toBeVisible();

	const deleteButton = page.getByRole('button', { name: 'Delete', exact: true });
	await expect(deleteButton).toBeVisible();
	await deleteButton.click();
};

const deleteAccount = async (page: Page) => {
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

const ensureLoggedOutAndConfirmationModalClosed = async (page: Page, signInButton: Locator) => {
	await page.waitForURL('/list');
	await expect(signInButton).toBeVisible();
	const confirmationPrompt = getDeletionConfirmationPrompt(page);
	await expect(confirmationPrompt).not.toBeVisible();
};

const ensureUserAccountIsDeleted = async (email: string) => {
	await expect(auth.getUserByEmail(email)).rejects.toThrow(
		/There is no user record corresponding to the provided identifier./
	);
};

const ensureUserItemsDeleted = async (userUid: string) => {
	await expect(async () => {
		const userItems = await firestore.collection(`users/${userUid}/items`).listDocuments();
		expect(userItems).toHaveLength(0);
	}).toPass();
};

const forceReauthenticationForAccountDeletion = (page: Page) =>
	page.evaluate(
		() =>
			((
				window as typeof window & { FORCE_ACCOUNT_DELETION_REAUTHENTICATION?: boolean }
			).FORCE_ACCOUNT_DELETION_REAUTHENTICATION = true)
	);

const expectSignInButtonAndSignInWithExistingAccount = async (
	page: Page,
	signInButton: Locator,
	email: string
) => {
	await expect(signInButton).toBeVisible();
	await signInButton.click();
	const existingAccount = page.getByText(email);
	await expect(existingAccount).toBeVisible();
	await existingAccount.click();
};
