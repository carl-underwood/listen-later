import { APIRequestContext, Page, expect, test } from '@playwright/test';
import dotenv from 'dotenv';
import { dirname } from 'path';
import { v4 as uuid } from 'uuid';
import {
	clickSignInAndExpectPromoteAccountAlertDialog,
	clickSignInWithEmailButton,
	clickSignOutButton,
	closeModal,
	closeNavigation,
	deleteAccount,
	ensureLoggedOutAndConfirmationModalClosed,
	expectListPageToBeVisible,
	expectNavigationItem,
	fillEmailInputClickSendSignInLinkAndExpectConfirmation,
	getPromoteAccountAlert,
	getVisibleItemWithName,
	goToListPage,
	goToSearchPageAddItemAndVerify,
	openNavigation,
	signInAnonymously
} from '../tests/helpers/shared';

dotenv.config({ path: `${dirname(import.meta.url.replace('file://', ''))}/.env` });

const FIREBASE_APPCHECK_DEBUG_TOKEN = process.env.FIREBASE_APPCHECK_DEBUG_TOKEN;
const MAILINATOR_API_TOKEN = process.env.MAILINATOR_API_TOKEN;

test('critical flow', async ({ page, request }) => {
	await setupAppCheckDebugTokenInitScript(page);

	// Old about page redirects home
	await page.goto('/about');
	await expect(page).toHaveURL('/');
	await expect(page.getByRole('heading', { level: 1 })).toHaveText('Listen Later');

	// Shows the expected naviation items when not signed in
	await page.goto('/');

	const navigationDrawer = page.getByRole('dialog', { name: 'Navigation drawer' });

	await expect(async () => {
		await openNavigation(page);

		await expect(navigationDrawer).toBeVisible({
			timeout: 200
		});
	}).toPass();

	await expectNavigationItem(navigationDrawer, 'Home', '/');
	await expectNavigationItem(navigationDrawer, 'List', '/list');
	await expectNavigationItem(
		navigationDrawer,
		'GitHub',
		'https://github.com/carl-underwood/listen-later'
	);

	// Shows a navigation item for settings and button to sign out in the navigation drawer when signed in
	await goToListPage(page);
	const signInButton = await signInAnonymously(page);

	await openNavigation(page);
	await expectNavigationItem(navigationDrawer, 'Settings', '/list/settings');
	await closeNavigation(page);

	await goToSearchPageAddItemAndVerify(page, 'Ezra Collective', '5BRAUN0yN8557PLRZIr02W');

	// Expands the newly added item
	const victoryDance = await goToSearchPageAddItemAndVerify(
		page,
		'Victory Dance',
		'6GumLQysBiahvtJmxMXOpn'
	);

	// Shows a button to open the item in Spotify
	const openInSpotifyLink = page.getByRole('link', { name: 'Open in Spotify' });
	await expect(openInSpotifyLink).toBeVisible();
	await expect(openInSpotifyLink).toHaveAttribute(
		'href',
		`https://open.spotify.com/track/6GumLQysBiahvtJmxMXOpn?go=1`
	);

	// Allows items to be marked as listened to
	const listenedSwitch = page.getByRole('switch', { name: 'Listened' });
	const listenedSwitchUnderlyingCheckbox = listenedSwitch.locator("input[type='checkbox']");
	await expect(listenedSwitch).toBeVisible();
	await expect(listenedSwitch).not.toBeChecked();
	await listenedSwitch.click();
	await expect(listenedSwitch).toBeChecked();

	// Wait for the change to be persisted
	await expect(listenedSwitchUnderlyingCheckbox).not.toBeDisabled();

	await page.reload();

	await expect(victoryDance).toBeVisible();
	await expect(listenedSwitch).toBeVisible();
	await expect(listenedSwitch).toBeChecked();

	// Shows metadata for song Spotify items
	await expect(victoryDance.getByText('Song')).toBeVisible();
	await expect(victoryDance.getByText('Ezra Collective')).toBeVisible();
	await expect(victoryDance.getByText("Where I'm Meant To Be")).toBeVisible();

	// Allows an item to be deleted
	const victoryDanceDeleteButton = page.getByRole('button', { name: 'Delete Victory Dance' });
	await expect(victoryDanceDeleteButton).toBeVisible();
	await victoryDanceDeleteButton.click();

	const confirmationPrompt = page.getByText('Are you sure you want to delete Victory Dance?');
	await expect(confirmationPrompt).toBeVisible();

	const deleteButton = page.getByRole('button', { name: 'Delete', exact: true });
	await expect(deleteButton).toBeVisible();
	await deleteButton.click();

	await expect(confirmationPrompt).not.toBeVisible();

	await expect(victoryDance).not.toBeVisible();

	// Promote account
	const promoteAccountAlert = getPromoteAccountAlert(page);

	const promoteAccountAlertDialog = await clickSignInAndExpectPromoteAccountAlertDialog(
		page,
		promoteAccountAlert
	);

	await closeModal(page);
	await page.waitForURL('/list/settings');
	await expect(promoteAccountAlert).toBeVisible();
	await expect(promoteAccountAlertDialog).not.toBeVisible();
	await clickSignInAndExpectPromoteAccountAlertDialog(page, promoteAccountAlert, 'button');

	await clickSignInWithEmailButton(page);
	const email = `${uuid()}@listenlater.testinator.com`;
	await fillEmailInputClickSendSignInLinkAndExpectConfirmation(page, email);

	await expect(async () => {
		await gotoSignInLinkFromMailinator(email, request, page);
		await expectListPageToBeVisible(page);
	}).toPass();

	const ezraCollective = await getVisibleItemWithName(page, 'Ezra Collective', { expanded: false });

	await expect(promoteAccountAlert).not.toBeVisible();
	await expect(ezraCollective).toBeVisible();

	await openNavigation(page);
	await clickSignOutButton(page);
	await closeNavigation(page);

	await clickSignInWithEmailButton(page);
	await fillEmailInputClickSendSignInLinkAndExpectConfirmation(page, email);

	await gotoSignInLinkFromMailinator(email, request, page, 2);

	await expectListPageToBeVisible(page);
	await expect(promoteAccountAlert).not.toBeVisible();
	await expect(ezraCollective).toBeVisible();

	// Delete account
	await deleteAccount(page);
	await ensureLoggedOutAndConfirmationModalClosed(page, signInButton);
});

const setupAppCheckDebugTokenInitScript = (page: Page) =>
	page.addInitScript((appCheckDebugToken: string | undefined) => {
		(
			self as Window & typeof globalThis & { FIREBASE_APPCHECK_DEBUG_TOKEN: string | undefined }
		).FIREBASE_APPCHECK_DEBUG_TOKEN = appCheckDebugToken;
	}, FIREBASE_APPCHECK_DEBUG_TOKEN);

const gotoSignInLinkFromMailinator = (
	email: string,
	request: APIRequestContext,
	page: Page,
	expectCount = 1
) =>
	expect(async () => {
		const inboxResponse = await request.get(
			`https://mailinator.com/api/v2/domains/listenlater.testinator.com/inboxes/${
				email.split('@')[0]
			}`,
			{
				headers: {
					Authorization: MAILINATOR_API_TOKEN || ''
				}
			}
		);

		const messageJson = await inboxResponse.json();
		expect(messageJson.msgs).toHaveLength(expectCount);

		const messageId = messageJson.msgs[0]?.id;

		expect(messageId).not.toBeUndefined();

		const messageResponse = await request.get(
			`https://mailinator.com/api/v2/domains/listenlater.testinator.com/inboxes/${
				email.split('@')[0]
			}/messages/${messageId}`,
			{
				headers: {
					Authorization: MAILINATOR_API_TOKEN || ''
				}
			}
		);

		const messageResponseJson = await messageResponse.json();
		const htmlMessage = messageResponseJson.parts.find(
			(part: { headers: Record<string, string>; body: string }) =>
				part.headers['content-type'].startsWith('text/html')
		);

		await page.setContent(htmlMessage.body);
		const href = await page
			.getByRole('link', { name: 'Sign in to Listen Later' })
			.getAttribute('href');

		expect(href).toBeTruthy();

		await page.goto(href!);

		return messageId;
	}).toPass();
