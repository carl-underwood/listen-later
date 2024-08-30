<script lang="ts">
	import { auth } from '$lib/stores/auth';
	import { user } from '$lib/stores/user';
	import { loading } from '$lib/stores/loading';
	import Loading from '$lib/components/Loading.svelte';
	import SignInForm from '$lib/components/SignInForm.svelte';

	let showingEmailForm = false;

	const tryEmailLink = async (email: string) => {
		const { signInWithEmailLink } = await import('firebase/auth');
		await signInWithEmailLink($auth, email, window.location.href);
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
</script>

<svelte:head>
	<meta name="robots" content="noindex" />
</svelte:head>

<div class="max-w-2xl mx-auto pb-4" aria-live="polite">
	{#if $user === undefined}
		<Loading />
	{:else if $user === null}
		{#if !showingEmailForm}
			<div class="px-4 pb-8 flex flex-col gap-4 items-center text-center">
				<p>
					By continuing to use Listen Later, you agree to the <a
						href="/terms-of-use"
						class="underline">Terms of Use</a
					>
					& <a href="/privacy-policy" class="underline">Privacy Policy</a>
				</p>
				<hr class="!border-t-2 w-full my-4" />
				<p>You can try out Listen Later without signing in.</p>
				<p>
					If you like it, after you've added an item to your list you can sign in to create an
					account (you'll be prompted to do so from your list page).
				</p>
				<p>
					<strong>
						Please note that when trying out Listen Later without an account your list won't be
						available on other browsers / devices, and could be lost entirely (e.g. if browsing data
						is cleared). As such, it's recommended to create a full account if you wish to continue
						using Listen Later after trying it out.
					</strong>
				</p>
				<button
					on:click={() => loading.whileAwaiting(auth.signInAnonymously)}
					disabled={$loading}
					class="btn bg-surface-900-50-token text-surface-50-900-token"
				>
					Try it out
				</button>
				<div class="self-stretch mt-4 relative">
					<hr class="!border-t-2 absolute left-0 right-0 top-3 -z-[1]" />
					<span class="inline-block h-6 px-4 bg-surface-50-900-token">or</span>
				</div>
			</div>
		{/if}
		<SignInForm
			on:emailFormToggled={(event) => (showingEmailForm = event.detail.showingEmailForm)}
			on:signInWithGoogleClicked={signInWithGoogle}
			{tryEmailLink}
		/>
	{:else}
		<slot />
	{/if}
</div>
