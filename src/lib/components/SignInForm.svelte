<script lang="ts">
	import { createEventDispatcher, onDestroy } from 'svelte';
	import { auth } from '$lib/stores/auth';
	import { user } from '$lib/stores/user';
	import { loading } from '$lib/stores/loading';
	import SignInWithGoogleButton from './SignInWithGoogleButton.svelte';
	import type { AuthError } from 'firebase/auth';
	import { goto } from '$app/navigation';

	const dispatch = createEventDispatcher();

	export let tryEmailLink: (email: string) => Promise<void>;

	let isSignInWithEmailLinkChecked = false;
	let email = '';
	let showEmailForm = false;
	let showEmailError = false;
	let showEmailConfirmation = false;
	let confirmingEmailForSignIn = false;

	$: if ($user) {
		resetSignInState();
	}

	$: dispatch('emailFormToggled', { showingEmailForm: showEmailForm });

	const authUnsubscribe = auth.subscribe(async ($auth) => {
		if (!$auth || isSignInWithEmailLinkChecked) {
			return;
		}

		await loading.whileAwaiting(async () => {
			const { isSignInWithEmailLink } = await import('firebase/auth');

			isSignInWithEmailLinkChecked = true;

			if (!isSignInWithEmailLink($auth, window.location.href)) {
				return;
			}

			const email = window.localStorage.getItem('emailForSignIn');

			if (!email) {
				showEmailForm = true;
				confirmingEmailForSignIn = true;
				return;
			}

			await tryHandleEmailLink(email);
		});
	});

	const tryHandleEmailLink = async (email: string) => {
		const { AuthErrorCodes } = await import('firebase/auth');

		try {
			showEmailError = false;
			await tryEmailLink(email);
			window.localStorage.removeItem('emailForSignIn');
			await stripEmailLinkSearchParams();
		} catch (error) {
			if ((error as AuthError).code !== AuthErrorCodes.INVALID_EMAIL) {
				resetSignInState();
				return;
			}

			confirmingEmailForSignIn = true;
			showEmailForm = true;
			showEmailError = true;
		}
	};

	const stripEmailLinkSearchParams = async () => {
		const searchParams = new URLSearchParams(window.location.search);
		searchParams.delete('mode');
		searchParams.delete('lang');
		searchParams.delete('oobCode');
		searchParams.delete('apiKey');
		await goto(`${window.location.pathname}?${searchParams.toString()}`);
	};

	const onEmailFormSubmit = async () => {
		if (!$auth) {
			return;
		}

		await loading.whileAwaiting(async () => {
			if (confirmingEmailForSignIn) {
				await tryHandleEmailLink(email);
				return;
			}

			const { sendSignInLinkToEmail } = await import('firebase/auth');

			await sendSignInLinkToEmail($auth, email, {
				url: window.location.href,
				handleCodeInApp: true
			});

			window.localStorage.setItem('emailForSignIn', email);
			showEmailConfirmation = true;
		});
	};

	const resetSignInState = () => {
		email = '';
		showEmailForm = false;
		showEmailError = false;
		showEmailConfirmation = false;
		confirmingEmailForSignIn = false;
	};

	onDestroy(authUnsubscribe);
</script>

<div class="px-4 flex flex-col gap-4 items-center text-center" aria-live="assertive">
	{#if showEmailConfirmation}
		Email sent, please check your inbox for a sign in link
	{:else if showEmailForm}
		<form class="flex flex-col items-center" on:submit|preventDefault={onEmailFormSubmit}>
			{#if confirmingEmailForSignIn}
				<span class="mb-4">Please confirm the email that received the sign in link</span>
			{/if}
			<label class="label">
				<span class="sr-only">Email</span>
				<input
					type="email"
					class="!bg-surface-50-900-token !border-surface-900-50-token border-4 focus:!ring-4 focus:ring-inset focus:ring-surface-500"
					placeholder="Email"
					required
					bind:value={email}
					on:invalid|preventDefault={() => (showEmailError = true)}
				/>
			</label>

			<small
				role={showEmailError ? 'alert' : ''}
				class="text-error-600-300-token min-h-[1.5rem] block text-center"
			>
				{#if showEmailError}
					{confirmingEmailForSignIn
						? 'Please enter the email that received the sign in link'
						: 'Please enter a valid email address'}
				{/if}
			</small>

			<div class="flex flex-wrap gap-4 justify-center">
				<button class="btn bg-surface-900-50-token text-surface-50-900-token" disabled={$loading}>
					{!confirmingEmailForSignIn ? 'Send sign in link' : 'Sign in'}
				</button>
				{#if !confirmingEmailForSignIn}
					<button
						class="btn variant-soft"
						type="button"
						disabled={$loading}
						on:click={resetSignInState}
					>
						Cancel
					</button>
				{/if}
			</div>
		</form>
	{:else}
		<button
			disabled={$loading}
			class="btn bg-surface-900-50-token text-surface-50-900-token"
			on:click={() => (showEmailForm = true)}
		>
			Sign in with Email
		</button>
		<SignInWithGoogleButton on:click={() => dispatch('signInWithGoogleClicked')} />
	{/if}
</div>
