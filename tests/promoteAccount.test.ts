import { test, expect, type Page, type Locator } from '@playwright/test';
import { v4 as uuid } from 'uuid';
import {
	autoGenerateOAuthUserDetails,
	clickSignInWithAppleButton,
	clickSignInWithEmailButton,
	clickSignInWithGoogleButton,
	clickSignOutButton,
	closeNavigation,
	completeSignInWithApple,
	completeSignInWithGoogle,
	expectListPageToBeVisible,
	fillEmailInputClickSendSignInLinkAndExpectConfirmation,
	getOAuthUserEmail,
	getVisibleItemWithName,
	goToListPage,
	goToSearchPageAddItemAndVerify,
	openNavigation,
	retreiveMostRecentOobCodeAndGoTo,
	signInAnonymously,
	signInAsExistingOAuthUser
} from './helpers/shared';
import retreiveMostRecentOobCode from './helpers/retrieveMostRecentOobCode';
import { skipTestOnWebkit } from './helpers/skipTestOnWebkit';

test.describe('list page', () => {
	test('shows an alert suggesting account promotion when an anonymous user has added an item and allows promotion via email', async ({
		page,
		request
	}) => {
		await goToListPage(page);
		await signInAnonymously(page);
		await expectListPageToBeVisible(page);

		const { promoteAccountAlert, name } = await addItemAndExpectPromoteAccountAlert(page);

		await clickSignInAndExpectPromoteAccountAlertDialog(page, promoteAccountAlert);

		await clickSignInWithEmailButton(page);
		const email = `${uuid()}@listenlater.cloud`;
		await fillEmailInputClickSendSignInLinkAndExpectConfirmation(page, email);

		await retreiveMostRecentOobCodeAndGoTo(email, request, page);

		await expectListPageToBeVisible(page);

		const newItem = await getVisibleItemWithName(page, name, { expanded: false });

		await expect(promoteAccountAlert).not.toBeVisible();
		await expect(newItem).toBeVisible();

		await openNavigation(page);
		await clickSignOutButton(page);
		await closeNavigation(page);

		await clickSignInWithEmailButton(page);
		await fillEmailInputClickSendSignInLinkAndExpectConfirmation(page, email);

		await retreiveMostRecentOobCodeAndGoTo(email, request, page);

		await expectListPageToBeVisible(page);
		await expect(promoteAccountAlert).not.toBeVisible();
		await expect(newItem).toBeVisible();
	});

	test('shows an alert suggesting account promotion when an anonymous user has added an item and allows promotion via email in a different browser context', async ({
		browser,
		request
	}) => {
		const firstContext = await browser.newContext();
		const firstPage = await firstContext.newPage();
		await goToListPage(firstPage);
		await signInAnonymously(firstPage);
		await expectListPageToBeVisible(firstPage);

		const { promoteAccountAlert: firstPagePromoteAccountAlert, name } =
			await addItemAndExpectPromoteAccountAlert(firstPage);

		await clickSignInAndExpectPromoteAccountAlertDialog(firstPage, firstPagePromoteAccountAlert);

		await clickSignInWithEmailButton(firstPage);
		const email = `${uuid()}@listenlater.cloud`;
		await fillEmailInputClickSendSignInLinkAndExpectConfirmation(firstPage, email);

		await retreiveMostRecentOobCodeAndGoTo(email, request, firstPage);

		await expectListPageToBeVisible(firstPage);

		const firstPageNewItem = await getVisibleItemWithName(firstPage, name, { expanded: false });

		await expect(firstPagePromoteAccountAlert).not.toBeVisible();
		await expect(firstPageNewItem).toBeVisible();

		await openNavigation(firstPage);
		await clickSignOutButton(firstPage);
		await closeNavigation(firstPage);

		await clickSignInWithEmailButton(firstPage);
		await fillEmailInputClickSendSignInLinkAndExpectConfirmation(firstPage, email);

		const oobCode = await retreiveMostRecentOobCode(email, request);

		const secondContext = await browser.newContext();
		const secondPage = await secondContext.newPage();
		await secondPage.goto(oobCode.oobLink);

		await expect(
			secondPage.getByText('Please confirm the email that received the sign in link')
		).toBeVisible();

		const emailConfirmationInput = secondPage.getByLabel('Email');
		await expect(emailConfirmationInput).toBeVisible();
		await emailConfirmationInput.fill(email);

		const signInButton = secondPage.getByRole('button', { name: 'Sign in' });
		await expect(signInButton).toBeVisible();
		await signInButton.click();

		const secondPageNewItem = await getVisibleItemWithName(secondPage, name, { expanded: false });
		const secondPagePromoteAccountAlert = getPromoteAccountAlert(secondPage);

		await expectListPageToBeVisible(secondPage);
		await expect(secondPagePromoteAccountAlert).not.toBeVisible();
		await expect(secondPageNewItem).toBeVisible();
	});

	test('shows an alert suggesting account promotion when an anonymous user has added an item and allows promotion via Google', async ({
		page,
		browserName
	}) => {
		skipTestOnWebkit(browserName);

		await goToListPage(page);
		await signInAnonymously(page);
		await expectListPageToBeVisible(page);

		const { promoteAccountAlert, name } = await addItemAndExpectPromoteAccountAlert(page);

		await clickSignInAndExpectPromoteAccountAlertDialog(page, promoteAccountAlert);

		await clickSignInWithGoogleButton(page);
		await autoGenerateOAuthUserDetails(page);
		const email = await getOAuthUserEmail(page);
		await completeSignInWithGoogle(page);

		await expectListPageToBeVisible(page);

		const newItem = await getVisibleItemWithName(page, name, { expanded: false });

		await expect(promoteAccountAlert).not.toBeVisible();
		await expect(newItem).toBeVisible();

		await openNavigation(page);
		await clickSignOutButton(page);
		await closeNavigation(page);

		await clickSignInWithGoogleButton(page);
		await signInAsExistingOAuthUser(page, email);

		await expectListPageToBeVisible(page);
		await expect(promoteAccountAlert).not.toBeVisible();
		await expect(newItem).toBeVisible();
	});

	test('shows an alert suggesting account promotion when an anonymous user has added an item and allows promotion via Apple', async ({
		page,
		browserName
	}) => {
		skipTestOnWebkit(browserName);

		await goToListPage(page);
		await signInAnonymously(page);
		await expectListPageToBeVisible(page);

		const { promoteAccountAlert, name } = await addItemAndExpectPromoteAccountAlert(page);

		await clickSignInAndExpectPromoteAccountAlertDialog(page, promoteAccountAlert);

		await clickSignInWithAppleButton(page);
		await autoGenerateOAuthUserDetails(page);
		const email = await getOAuthUserEmail(page);
		await completeSignInWithApple(page);

		await expectListPageToBeVisible(page);

		const newItem = await getVisibleItemWithName(page, name, { expanded: false });

		await expect(promoteAccountAlert).not.toBeVisible();
		await expect(newItem).toBeVisible();

		await openNavigation(page);
		await clickSignOutButton(page);
		await closeNavigation(page);

		await clickSignInWithAppleButton(page);
		await signInAsExistingOAuthUser(page, email);

		await expectListPageToBeVisible(page);
		await expect(promoteAccountAlert).not.toBeVisible();
		await expect(newItem).toBeVisible();
	});

	test('shows an error when attempting to promote an anonymous account using a Google credential that already has an account', async ({
		page,
		browserName
	}) => {
		skipTestOnWebkit(browserName);

		await goToListPage(page);
		await clickSignInWithGoogleButton(page);
		await autoGenerateOAuthUserDetails(page);
		const email = await getOAuthUserEmail(page);
		await completeSignInWithGoogle(page);
		await expectListPageToBeVisible(page);

		await openNavigation(page);
		await clickSignOutButton(page);
		await closeNavigation(page);

		await signInAnonymously(page);
		await expectListPageToBeVisible(page);

		const { promoteAccountAlert } = await addItemAndExpectPromoteAccountAlert(page);

		await clickSignInAndExpectPromoteAccountAlertDialog(page, promoteAccountAlert);

		await clickSignInWithGoogleButton(page);
		await signInAsExistingOAuthUser(page, email);

		await expectPromoteAccountAlertDialog(page);
		await expect(
			page.getByText(
				'You tried to sign in to an account that already exists. ' +
					'Please try signing in again with a different account. ' +
					'Alternatively, if you wish to use that account, please sign out before signing in again ' +
					'(items in this guest account list will need to be manually added to that account).'
			)
		).toBeVisible();
	});

	test('shows an error when attempting to promote an anonymous account using a Apple credential that already has an account', async ({
		page,
		browserName
	}) => {
		skipTestOnWebkit(browserName);

		await goToListPage(page);
		await clickSignInWithAppleButton(page);
		await autoGenerateOAuthUserDetails(page);
		const email = await getOAuthUserEmail(page);
		await completeSignInWithApple(page);
		await expectListPageToBeVisible(page);

		await openNavigation(page);
		await clickSignOutButton(page);
		await closeNavigation(page);

		await signInAnonymously(page);
		await expectListPageToBeVisible(page);

		const { promoteAccountAlert } = await addItemAndExpectPromoteAccountAlert(page);

		await clickSignInAndExpectPromoteAccountAlertDialog(page, promoteAccountAlert);

		await clickSignInWithAppleButton(page);
		await signInAsExistingOAuthUser(page, email);

		await expectPromoteAccountAlertDialog(page);
		await expect(
			page.getByText(
				'You tried to sign in to an account that already exists. ' +
					'Please try signing in again with a different account. ' +
					'Alternatively, if you wish to use that account, please sign out before signing in again ' +
					'(items in this guest account list will need to be manually added to that account).'
			)
		).toBeVisible();
	});

	test('shows an error when attempting to promote an anonymous account using an email that already has an account', async ({
		page,
		request
	}) => {
		await goToListPage(page);

		await clickSignInWithEmailButton(page);
		const email = `${uuid()}@listenlater.cloud`;
		await fillEmailInputClickSendSignInLinkAndExpectConfirmation(page, email);
		await retreiveMostRecentOobCodeAndGoTo(email, request, page);

		await expectListPageToBeVisible(page);

		await openNavigation(page);
		await clickSignOutButton(page);
		await closeNavigation(page);

		await signInAnonymously(page);
		await expectListPageToBeVisible(page);

		const { promoteAccountAlert } = await addItemAndExpectPromoteAccountAlert(page);

		await clickSignInAndExpectPromoteAccountAlertDialog(page, promoteAccountAlert);

		await clickSignInWithEmailButton(page);
		await fillEmailInputClickSendSignInLinkAndExpectConfirmation(page, email);
		await retreiveMostRecentOobCodeAndGoTo(email, request, page);

		await expectPromoteAccountAlertDialog(page);
		await expect(
			page.getByText(
				'You tried to sign in to an account that already exists. ' +
					'Please try signing in again with a different account. ' +
					'Alternatively, if you wish to use that account, please sign out before signing in again ' +
					'(items in this guest account list will need to be manually added to that account).'
			)
		).toBeVisible();
	});
});

const getPromoteAccountAlert = (page: Page) =>
	page.getByRole('alert').filter({ hasText: 'Sign in to keep your list' });

const addItemAndExpectPromoteAccountAlert = async (page: Page) => {
	const promoteAccountAlert = getPromoteAccountAlert(page);
	await expect(promoteAccountAlert).not.toBeVisible();

	const name = 'Victory Dance';
	const id = '6cQzmvrbnCM1d51XOodmPR';
	await goToSearchPageAddItemAndVerify(page, name, id);

	await expect(promoteAccountAlert).toBeVisible();
	return { promoteAccountAlert, name };
};

const expectPromoteAccountAlertDialog = async (page: Page) => {
	const promoteAccountDialog = page.getByTestId('modal-component').locator('div').first();
	await expect(promoteAccountDialog).toBeVisible();
};

const clickSignInAndExpectPromoteAccountAlertDialog = async (
	page: Page,
	promoteAccountAlert: Locator
) => {
	const promoteAccountButton = promoteAccountAlert.getByRole('link', { name: 'Sign in' });
	await expect(promoteAccountButton).toBeVisible();
	await promoteAccountButton.click();
	await page.waitForURL('/list/settings?promoteAccount=true');

	await expectPromoteAccountAlertDialog(page);
};
