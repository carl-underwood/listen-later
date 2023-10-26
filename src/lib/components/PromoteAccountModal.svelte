<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { getModalStore } from '@skeletonlabs/skeleton';
	import { loading } from '$lib/stores/loading';
	import { user } from '$lib/stores/user';
	import { auth } from '$lib/stores/auth';
	import type { AuthError } from 'firebase/auth';
	import SignInForm from './SignInForm.svelte';

	const modalStore = getModalStore();

	let showCredentialAlreadyInUseError = false;

	const tryEmailLink = (email: string) =>
		loading.whileAwaiting(async () => {
			const { AuthErrorCodes, EmailAuthProvider, linkWithCredential } = await import(
				'firebase/auth'
			);

			try {
				const credential = EmailAuthProvider.credentialWithLink(email, window.location.href);
				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
				await linkWithCredential($user!, credential);
			} catch (error) {
				if ((error as AuthError).code === AuthErrorCodes.EMAIL_EXISTS) {
					showCredentialAlreadyInUseError = true;
					return;
				}

				throw error;
			}

			await closeModalAndRedirectToList();
		});

	const linkWithGoogle = () =>
		loading.whileAwaiting(async () => {
			const { GoogleAuthProvider, linkWithRedirect } = await import('firebase/auth');

			const provider = new GoogleAuthProvider();

			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			await linkWithRedirect($user!, provider);
		});

	const linkWithApple = () =>
		loading.whileAwaiting(async () => {
			const { OAuthProvider, linkWithRedirect } = await import('firebase/auth');

			const provider = new OAuthProvider('apple.com');

			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			await linkWithRedirect($user!, provider);
		});

	const closeModalAndRedirectToList = async () => {
		await goto('/list');
		modalStore.close();
	};

	onMount(() =>
		loading.whileAwaiting(async () => {
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			if (!$user!.isAnonymous) {
				await closeModalAndRedirectToList();
				return;
			}

			const { getRedirectResult, AuthErrorCodes } = await import('firebase/auth');

			try {
				await getRedirectResult($auth);
			} catch (error) {
				if ((error as AuthError).code === AuthErrorCodes.CREDENTIAL_ALREADY_IN_USE) {
					showCredentialAlreadyInUseError = true;
					return;
				}

				throw error;
			}
		})
	);
</script>

<div class="card p-4" aria-live="polite">
	<div class="flex flex-col gap-4 items-center text-center">
		{#if !showCredentialAlreadyInUseError}
			<p>Please sign in to create your account</p>
		{:else}
			<p role="alert" class="text-error-600-300-token max-w-md">
				You tried to sign in to an account that already exists.
				<br />
				<br />
				Please try signing in again with a different account.
				<br />
				<br />
				Alternatively, if you wish to use that account, please sign out before signing in again (items
				in this guest account list will need to be manually added to that account).
			</p>
		{/if}
		<SignInForm
			on:signInWithGoogleClicked={linkWithGoogle}
			on:signInWithAppleClicked={linkWithApple}
			{tryEmailLink}
		/>
	</div>
</div>
