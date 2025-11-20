<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { auth } from '$lib/stores/auth';
	import { loading } from '$lib/stores/loading';
	import { user } from '$lib/stores/user';
	import { focusTrap, getModalStore } from '@skeletonlabs/skeleton';
	import type { AuthError } from 'firebase/auth';
	import { onMount } from 'svelte';
	import SignInForm from './SignInForm.svelte';

	const modalStore = getModalStore();

	let showCredentialAlreadyInUseError = $state(false);
	let trapFocus = $state(false);

	const tryEmailLink = (email: string) =>
		loading.whileAwaiting(async () => {
			const { AuthErrorCodes, EmailAuthProvider, linkWithCredential } = await import(
				'firebase/auth'
			);

			try {
				const credential = EmailAuthProvider.credentialWithLink(email, window.location.href);
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

			await linkWithRedirect($user!, provider);
		});

	const closeModalAndRedirectToList = async () => {
		await goto(resolve('/list'));
		modalStore.close();
	};

	onMount(async () => {
		await loading.whileAwaiting(async () => {
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
		});

		trapFocus = true;
	});
</script>

<div class="card p-4" aria-live="polite" use:focusTrap={trapFocus}>
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
		<SignInForm signInWithGoogleClicked={linkWithGoogle} {tryEmailLink} />
	</div>
</div>
