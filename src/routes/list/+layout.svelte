<script lang="ts">
	import { onDestroy } from 'svelte';
	import { auth } from '$lib/stores/auth';
	import { user } from '$lib/stores/user';
	import { loading } from '$lib/stores/loading';
	import Loading from '$lib/components/Loading.svelte';
	import type { AuthError } from 'firebase/auth';
	import Google from '$lib/components/icons/Google.svelte';
	import Apple from '$lib/components/icons/Apple.svelte';

	let isSignInWithEmailLinkChecked = false;
	let showEmailForm = false;
	let showEmailError = false;
	let showEmailConfirmation = false;
	let confirmingEmailForSignIn = false;
	let email = '';

	$: if ($user) {
		resetSignInState();
	}

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

			await trySignInWithEmailLink(email);
		});
	});

	const trySignInWithEmailLink = async (email: string) => {
		const { AuthErrorCodes, signInWithEmailLink } = await import('firebase/auth');

		try {
			showEmailError = false;
			await signInWithEmailLink($auth, email, window.location.href);
			window.localStorage.removeItem('emailForSignIn');
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

	const onEmailFormSubmit = async () => {
		if (!$auth) {
			return;
		}

		await loading.whileAwaiting(async () => {
			if (confirmingEmailForSignIn) {
				await trySignInWithEmailLink(email);

				return;
			}

			const { sendSignInLinkToEmail } = await import('firebase/auth');

			await loading.whileAwaiting(() =>
				sendSignInLinkToEmail($auth, email, {
					url: window.location.href,
					handleCodeInApp: true
				})
			);

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

	const signInWithGoogle = async () => {
		if (!$auth) {
			return;
		}

		await loading.whileAwaiting(async () => {
			const { GoogleAuthProvider, signInWithRedirect } = await import('firebase/auth');

			const provider = new GoogleAuthProvider();

			await signInWithRedirect($auth, provider);
		});
	};

	const signInWithApple = async () => {
		if (!$auth) {
			return;
		}

		await loading.whileAwaiting(async () => {
			const { OAuthProvider, signInWithRedirect } = await import('firebase/auth');

			const provider = new OAuthProvider('apple.com');

			await signInWithRedirect($auth, provider);
		});
	};

	onDestroy(authUnsubscribe);
</script>

<div class="max-w-2xl mx-auto" aria-live="polite">
	{#if $user === undefined}
		<Loading />
	{:else if $user === null}
		<div class="px-4 pb-4 flex flex-col gap-4 items-center text-center">
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
						<button class="btn bg-surface-900-50-token text-surface-50-900-token">
							{!confirmingEmailForSignIn ? 'Send sign in link' : 'Sign in'}
						</button>
						{#if !confirmingEmailForSignIn}
							<button class="btn variant-soft" type="button" on:click={resetSignInState}>
								Cancel
							</button>
						{/if}
					</div>
				</form>
			{:else}
				<button
					on:click={() => loading.whileAwaiting(auth.signInAnonymously)}
					disabled={$loading}
					class="btn bg-surface-900-50-token text-surface-50-900-token"
				>
					Sign in anonymously
				</button>
				<button
					disabled={$loading}
					class="btn bg-surface-900-50-token text-surface-50-900-token"
					on:click={() => (showEmailForm = true)}
				>
					Sign in with Email
				</button>
				<button
					disabled={$loading}
					class="btn bg-surface-900-50-token text-surface-50-900-token flex gap-2"
					on:click={signInWithGoogle}
				>
					<Google classes="w-6 h-6" />
					<span>Sign in with Google</span>
				</button>
				<button
					disabled={$loading}
					class="btn bg-surface-900-50-token text-surface-50-900-token flex gap-2"
					on:click={signInWithApple}
				>
					<Apple classes="w-6 h-6" />
					<span>Sign in with Apple</span>
				</button>
			{/if}
		</div>
	{:else}
		<slot />
	{/if}
</div>
