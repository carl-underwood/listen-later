<script lang="ts">
	import '../app.css';

	import { slide } from 'svelte/transition';
	import { browser, version } from '$app/environment';
	import { page } from '$app/state';
	import { afterNavigate } from '$app/navigation';
	import { AppBar, Modal } from '@skeletonlabs/skeleton-svelte';

	import { auth } from '$lib/stores/auth';
	import { user } from '$lib/stores/user';
	import { loading } from '$lib/stores/loading';
	import { prefersReducedMotion } from '$lib/stores/prefersReducedMotion';
	import Bars from '$lib/components/icons/bars.svelte';
	import Close from '$lib/components/icons/close.svelte';
	import NavMenuItem from '$lib/components/NavMenuItem.svelte';
	import Home from '$lib/components/icons/home.svelte';
	import ListMusic from '$lib/components/icons/list-music.svelte';
	import Github from '$lib/components/icons/github.svelte';
	import Envelope from '$lib/components/icons/envelope.svelte';
	import UserSettings from '$lib/components/icons/user-settings.svelte';
	import PolicyLinks from '$lib/components/PolicyLinks.svelte';
	import {
		deleteAccountSearchParameterName,
		promoteAccountSearchParameterName
	} from './list/settings/searchParameters';

	import { PUBLIC_FIREBASE_PROJECT_ID } from '$env/static/public';

	if (
		browser &&
		(window.location.hostname == `${PUBLIC_FIREBASE_PROJECT_ID}.web.app` ||
			window.location.hostname == `${PUBLIC_FIREBASE_PROJECT_ID}.firebaseapp.com`)
	) {
		window.location.href = `https://listenlater.cloud${window.location.pathname}`;
	}

	let { children } = $props();

	let drawerState = $state(false);

	$effect(() => {
		page;
		drawerState = false;
	});

	$effect(() => {
		if (browser) {
			// document.head
			// 	.querySelector("meta[name='theme-color']")
			// 	?.setAttribute('content', $modeCurrent ? '#ffffff' : '#000000');
		}
	});

	afterNavigate((navigation) => {
		const searchParams = navigation.to?.url.searchParams;

		// if (
		// 	!searchParams?.has(deleteAccountSearchParameterName) &&
		// 	!searchParams?.has(promoteAccountSearchParameterName) &&
		// 	$modalStore[0]
		// ) {
		// 	modalStore.close();
		// }
	});

	const slideWithPrefersReducedMotion = (node: Element) =>
		slide(node, { duration: $prefersReducedMotion ? 0 : undefined });
</script>

<svelte:head>
	<title>{page.data.title}</title>
	<meta name="og:title" content={page.data.title} />
	<meta
		name="description"
		content="Curate a list of songs, artists, albums, podcasts and episodes that you want to listen to later with Spotify."
	/>
	<meta
		name="og:description"
		content="Curate a list of songs, artists, albums, podcasts and episodes that you want to listen to later with Spotify."
	/>
	<meta name="og:type" content="website" />
	<meta name="og:image" content="/android-chrome-512x512.png" />
	<meta name="og:image:type" content="image/png" />
	<meta name="og:image:width" content="512" />
	<meta name="og:image:height" content="512" />
	<meta name="og:image:alt" content="Listen Later Logo" />
	<meta name="og:url" content="https://listenlater.cloud" />
	<link rel="canonical" href={`https://listenlater.cloud${page.url.pathname}`} />
</svelte:head>

<AppBar background="bg-transparent" toolbarClasses="justify-end">
	{#snippet trail()}
		<!-- <LightSwitch ring="ring-2 ring-surface-950-50" /> -->
		<button
			type="button"
			class="btn-icon btn-icon-lg rounded-full bg-transparent"
			onclick={() => (drawerState = true)}
			disabled={$loading}
		>
			<Bars />
			<span class="sr-only">Open navigation drawer</span>
		</button>
	{/snippet}
</AppBar>

<Modal
	open={drawerState}
	onOpenChange={(e) => (drawerState = e.open)}
	positionerPadding="0"
	positionerJustify="justify-end"
	labelledby="navigation-drawer-label"
	contentBase="max-w-md"
	transitionsPositionerIn={{ x: '100%', duration: $prefersReducedMotion ? 0 : 200, opacity: 0 }}
	transitionsPositionerOut={{ x: '100%', duration: $prefersReducedMotion ? 0 : 500, opacity: 0 }}
	contentBackground="bg-surface-100-900"
>
	{#snippet content()}
		<div id="navigation-drawer-inner" class="flex flex-col">
			<div class="grow">
				<AppBar toolbarClasses="justify-end">
					{#snippet trail()}
						<button
							type="button"
							class="btn-icon btn-icon-lg rounded-full bg-transparent"
							onclick={() => (drawerState = false)}
							disabled={$loading}
						>
							<Close />
							<span class="sr-only">Close navigation drawer</span>
						</button>
					{/snippet}
				</AppBar>
				<nav class="list-nav p-8 flex flex-col">
					<span id="navigation-drawer-label" class="sr-only">Navigation drawer</span>
					<ul class="text-2xl flex flex-col gap-4">
						<NavMenuItem href="/">
							{#snippet icon()}<Home />{/snippet}
							Home
						</NavMenuItem>
						<NavMenuItem href="/list" nofollow>
							{#snippet icon()}<ListMusic />{/snippet}
							List
						</NavMenuItem>
						<NavMenuItem href="https://github.com/carl-underwood/listen-later">
							{#snippet icon()}<Github />{/snippet}
							GitHub
						</NavMenuItem>
						<NavMenuItem href="/contact">
							{#snippet icon()}<Envelope />{/snippet}
							Contact
						</NavMenuItem>
						{#if $user}
							<NavMenuItem href="/list/settings" transition={slideWithPrefersReducedMotion}>
								{#snippet icon()}<UserSettings />{/snippet}
								Settings
							</NavMenuItem>
						{/if}
					</ul>
				</nav>
				{#if $user}
					<div class="pb-8 flex justify-center">
						<button
							onclick={() => loading.whileAwaiting(auth.signOut)}
							disabled={$loading}
							class="btn preset-filled-error-500 btn-2xl"
							transition:slideWithPrefersReducedMotion
						>
							Sign out
						</button>
					</div>
				{/if}
			</div>
			<div class="p-8 flex flex-col text-center">
				<p>
					Made with <span aria-hidden="true">❤</span><span class="sr-only">love</span> by
					<a href="https://www.carl-underwood.dev" class="underline">Carl Underwood</a>
				</p>
				<small>Version {version}</small>
				<div>
					<PolicyLinks
						policyLinks={[
							{ name: 'Terms of Use', href: '/terms-of-use' },
							{ name: 'Privacy Policy', href: '/privacy-policy' }
						]}
					/>
				</div>
			</div>
		</div>
	{/snippet}
</Modal>

{@render children()}

<!-- <Modal duration={$prefersReducedMotion ? 0 : undefined} /> -->

<style>
	#navigation-drawer-inner {
		min-height: 100vh;
		min-height: 100dvh;
	}
</style>
