import { expect, test } from '@playwright/test';
import { v4 as uuid } from 'uuid';
import retreiveMostRecentOobCode from './helpers/retrieveMostRecentOobCode';
import {
	clickAddItemButton,
	clickSubmitSearchButton,
	fillSearchInput,
	getVisibleAddButton,
	selectOptionWithId
} from './helpers/list';

test.describe('list page', () => {
	test('shows a button to sign in anonymously when not signed in', async ({ page }) => {
		await page.goto('/list');

		const button = page.getByRole('button', { name: 'Sign in anonymously' });
		await expect(button).toBeVisible();
		await button.click();

		await expect(page.getByRole('heading', { name: 'List' })).toBeVisible();
	});

	test('shows a button to sign in with email when not signed in', async ({ page, request }) => {
		await page.goto('/list');

		const button = page.getByRole('button', { name: 'Sign in with Email' });
		await expect(button).toBeVisible();
		await button.click();

		const email = `${uuid()}@listenlater.cloud`;

		const emailInput = page.getByLabel('Email');
		await expect(emailInput).toBeVisible();
		await emailInput.fill(email);

		const sendSignInLinkButton = page.getByRole('button', { name: 'Send sign in link' });
		await expect(sendSignInLinkButton).toBeVisible();
		await sendSignInLinkButton.click();

		await expect(
			page.getByText('Email sent, please check your inbox for a sign in link')
		).toBeVisible();

		const oobCode = await retreiveMostRecentOobCode(email, request);

		await page.goto(oobCode.oobLink);
		await expect(page.getByRole('heading', { name: 'List' })).toBeVisible();
	});

	test('prompts for confirmation email when signing in with email in a new browser context', async ({
		request,
		browser
	}) => {
		const email = `${uuid()}@listenlater.cloud`;

		const firstContext = await browser.newContext();
		const firstPage = await firstContext.newPage();
		await firstPage.goto('/list');

		const button = firstPage.getByRole('button', { name: 'Sign in with Email' });
		await expect(button).toBeVisible();
		await button.click();

		const emailInput = firstPage.getByLabel('Email');
		await expect(emailInput).toBeVisible();
		await emailInput.fill(email);

		const sendSignInLinkButton = firstPage.getByRole('button', { name: 'Send sign in link' });
		await expect(sendSignInLinkButton).toBeVisible();
		await sendSignInLinkButton.click();

		await expect(
			firstPage.getByText('Email sent, please check your inbox for a sign in link')
		).toBeVisible();

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

		await expect(secondPage.getByRole('heading', { name: 'List' })).toBeVisible();
	});

	test('shows a button to sign in with Google when not signed in', async ({
		page,
		browserName
	}) => {
		test.skip(
			browserName === 'webkit',
			"Cross-domain iframe from localhost:5000 to localhost:9099 (for auth emulator) doesn't work in webkit"
		);

		await page.goto('/list');

		const button = page.getByRole('button', { name: 'Sign in with Google' });
		await expect(button).toBeVisible();
		await button.click();

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

		const signInWithGoogleDotComButton = page.getByRole('button', {
			name: 'Sign in with Google.com'
		});
		await expect(signInWithGoogleDotComButton).toBeVisible();
		await signInWithGoogleDotComButton.click();

		await page.waitForURL('/list');
		await expect(page.getByRole('heading', { name: 'List' })).toBeVisible();
	});

	test('links an account created via sign in with email when signing in with Google using the same email', async ({
		page,
		request,
		browserName
	}) => {
		test.skip(
			browserName === 'webkit',
			"Cross-domain iframe from localhost:5000 to localhost:9099 (for auth emulator) doesn't work in webkit"
		);

		await page.goto('/list');

		const button = page.getByRole('button', { name: 'Sign in with Email' });
		await expect(button).toBeVisible();
		await button.click();

		const email = `${uuid()}@listenlater.cloud`;

		const emailInput = page.getByLabel('Email');
		await expect(emailInput).toBeVisible();
		await emailInput.fill(email);

		const sendSignInLinkButton = page.getByRole('button', { name: 'Send sign in link' });
		await expect(sendSignInLinkButton).toBeVisible();
		await sendSignInLinkButton.click();

		await expect(
			page.getByText('Email sent, please check your inbox for a sign in link')
		).toBeVisible();

		const oobCode = await retreiveMostRecentOobCode(email, request);

		await page.goto(oobCode.oobLink);
		await expect(page.getByRole('heading', { name: 'List' })).toBeVisible();

		await clickAddItemButton(page);

		const id = '5Nu4AvrNgIx42nWGbteHLh';
		await fillSearchInput(page, 'Victory Dance');
		await clickSubmitSearchButton(page);
		await selectOptionWithId(page, id);

		const addButton = await getVisibleAddButton(page);
		await addButton.click();

		await page.waitForURL(`/list?itemId=spotify:${id}`);

		const newItem = page.getByRole('button', { name: /^Victory Dance/ });
		await expect(newItem).toBeVisible();
		await expect(newItem).toHaveAttribute('aria-expanded', 'true');

		const openNavigationDrawerButton = page.getByRole('button', { name: 'Open navigation' });
		await openNavigationDrawerButton.click();

		const signOutButton = page.getByRole('button', { name: 'Sign out' });
		await expect(signOutButton).toBeVisible();
		await signOutButton.click();

		const closeNavigationDrawerButton = page.getByRole('button', { name: 'Close navigation' });
		await closeNavigationDrawerButton.click();

		const signInWithGoogleButton = page.getByRole('button', { name: 'Sign in with Google' });
		await expect(signInWithGoogleButton).toBeVisible();
		await signInWithGoogleButton.click();

		await expect(async () => {
			const addNewAccountButton = page.getByRole('button', { name: 'Add new account' });
			await expect(addNewAccountButton).toBeVisible();
			await addNewAccountButton.click();

			const authEmulatorEmailInput = page.locator('[id="email-input"]');
			await expect(authEmulatorEmailInput).toBeVisible();
			await authEmulatorEmailInput.fill(email);
		}).toPass();

		const signInWithGoogleDotComButton = page.getByRole('button', {
			name: 'Sign in with Google.com'
		});
		await expect(signInWithGoogleDotComButton).toBeVisible();
		await signInWithGoogleDotComButton.click();

		await page.waitForURL(`/list?itemId=spotify:${id}`);
		await expect(page.getByRole('heading', { name: 'List' })).toBeVisible();
		await expect(newItem).toBeVisible();
	});
});
