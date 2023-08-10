import { expect, test } from '@playwright/test';
import { v4 as uuid } from 'uuid';
import retreiveMostRecentOobCode from './helpers/retrieveMostRecentOobCode';
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
	fillOAuthUserEmail,
	goToListPage,
	goToSearchPageAddItemAndVerify,
	openNavigation,
	retreiveMostRecentOobCodeAndGoTo,
	signInAnonymously,
	waitForUrlWithSpotifyItemOpen
} from './helpers/shared';
import { skipTestOnWebkit } from './helpers/skipTestOnWebkit';

test.describe('list page', () => {
	test('shows a button to "Try it out" (sign in anonymously) when not signed in', async ({
		page
	}) => {
		await goToListPage(page);
		await signInAnonymously(page);
		await expectListPageToBeVisible(page);
	});

	test('shows a button to sign in with email when not signed in', async ({ page, request }) => {
		await goToListPage(page);

		await clickSignInWithEmailButton(page);

		const email = `${uuid()}@listenlater.cloud`;

		await fillEmailInputClickSendSignInLinkAndExpectConfirmation(page, email);

		await retreiveMostRecentOobCodeAndGoTo(email, request, page);
		await expectListPageToBeVisible(page);
	});

	test('prompts for confirmation email when signing in with email in a new browser context', async ({
		request,
		browser
	}) => {
		const email = `${uuid()}@listenlater.cloud`;

		const firstContext = await browser.newContext();
		const firstPage = await firstContext.newPage();
		await goToListPage(firstPage);

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

		await expectListPageToBeVisible(secondPage);
	});

	test('shows a button to sign in with Google when not signed in', async ({
		page,
		browserName
	}) => {
		skipTestOnWebkit(browserName);

		await goToListPage(page);
		await clickSignInWithGoogleButton(page);
		await autoGenerateOAuthUserDetails(page);
		await completeSignInWithGoogle(page);
		await expectListPageToBeVisible(page);
	});

	test('links an account created via sign in with email when signing in with Google using the same email', async ({
		page,
		request,
		browserName
	}) => {
		skipTestOnWebkit(browserName);

		await goToListPage(page);
		await clickSignInWithEmailButton(page);

		const email = `${uuid()}@listenlater.cloud`;

		await fillEmailInputClickSendSignInLinkAndExpectConfirmation(page, email);

		await retreiveMostRecentOobCodeAndGoTo(email, request, page);
		await expectListPageToBeVisible(page);

		const name = 'Victory Dance';
		const id = '5Nu4AvrNgIx42nWGbteHLh';
		const newItem = await goToSearchPageAddItemAndVerify(page, name, id);

		await openNavigation(page);
		await clickSignOutButton(page);
		await closeNavigation(page);

		await clickSignInWithGoogleButton(page);
		await fillOAuthUserEmail(page, email);
		await completeSignInWithGoogle(page);

		await waitForUrlWithSpotifyItemOpen(page, id);
		await expectListPageToBeVisible(page);
		await expect(newItem).toBeVisible();
	});

	test('shows a button to sign in with Apple when not signed in', async ({ page, browserName }) => {
		skipTestOnWebkit(browserName);

		await goToListPage(page);
		await clickSignInWithAppleButton(page);
		await autoGenerateOAuthUserDetails(page);
		await completeSignInWithApple(page);
		await expectListPageToBeVisible(page);
	});

	test('links an account created via sign in with email when signing in with Apple using the same email', async ({
		page,
		request,
		browserName
	}) => {
		skipTestOnWebkit(browserName);

		await goToListPage(page);
		await clickSignInWithEmailButton(page);

		const email = `${uuid()}@listenlater.cloud`;

		await fillEmailInputClickSendSignInLinkAndExpectConfirmation(page, email);
		await retreiveMostRecentOobCodeAndGoTo(email, request, page);
		await expectListPageToBeVisible(page);

		const name = 'Victory Dance';
		const id = '5Nu4AvrNgIx42nWGbteHLh';
		const newItem = await goToSearchPageAddItemAndVerify(page, name, id);

		await openNavigation(page);
		await clickSignOutButton(page);
		await closeNavigation(page);

		await clickSignInWithAppleButton(page);
		await fillOAuthUserEmail(page, email);
		await completeSignInWithApple(page);

		await waitForUrlWithSpotifyItemOpen(page, id);
		await expectListPageToBeVisible(page);
		await expect(newItem).toBeVisible();
	});
});
