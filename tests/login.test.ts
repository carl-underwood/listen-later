import { expect, test, type BrowserContext } from '@playwright/test';
import { v4 as uuid } from 'uuid';
import retreiveMostRecentOobCode from './helpers/retrieveMostRecentOobCode';

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

	test('shows a navigation item for settings and button to sign out in the navigation drawer when signed in', async ({
		page
	}) => {
		await page.goto('/list');
		const signInButton = page.getByRole('button', { name: 'Sign in anonymously' });
		await expect(signInButton).toBeVisible();
		await signInButton.click();

		const navigationDrawerButton = page.getByRole('button', { name: 'Open navigation' });
		await navigationDrawerButton.click();

		const settingsNavigationItem = page.getByRole('link', { name: 'Settings' });
		await expect(settingsNavigationItem).toBeVisible();
		await expect(settingsNavigationItem).toHaveAttribute('href', '/settings');

		const signOutButton = page.getByRole('button', { name: 'Sign out' });
		await expect(signOutButton).toBeVisible();
		await signOutButton.click();

		await expect(signInButton).toBeVisible();
	});
});
