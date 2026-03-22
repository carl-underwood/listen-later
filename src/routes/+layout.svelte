<script lang="ts">
	import '../theme.postcss';
	import '../app.postcss';

	import { browser } from '$app/environment';
	import { page } from '$app/state';
	import { afterNavigate } from '$app/navigation';
	import {
		initializeStores,
		AppBar,
		Drawer,
		getDrawerStore,
		LightSwitch,
		Modal,
		getModalStore,
		modeCurrent
	} from '@skeletonlabs/skeleton';

	import { loading } from '$lib/stores/loading';
	import { prefersReducedMotion } from '$lib/stores/prefersReducedMotion';
	import Bars from '$lib/components/icons/bars.svelte';
	import NavigationDrawerContent from '$lib/components/NavigationDrawerContent.svelte';
	import SortDrawerContent from '$lib/components/SortDrawerContent.svelte';
	import {
		deleteAccountSearchParameterName,
		promoteAccountSearchParameterName
	} from './list/settings/searchParameters';

	import { PUBLIC_FIREBASE_PROJECT_ID } from '$env/static/public';
	import { drawerIds } from '$lib/types/Drawers';

	initializeStores();
	const drawerStore = getDrawerStore();
	const modalStore = getModalStore();

	if (
		browser &&
		(window.location.hostname == `${PUBLIC_FIREBASE_PROJECT_ID}.web.app` ||
			window.location.hostname == `${PUBLIC_FIREBASE_PROJECT_ID}.firebaseapp.com`)
	) {
		window.location.href = `https://listenlater.cloud${window.location.pathname}`;
	}

	let { children } = $props();

	$effect(() => {
		// eslint-disable-next-line @typescript-eslint/no-unused-expressions
		page.route;
		drawerStore.close();
	});

	$effect(() => {
		if (browser) {
			document.head
				.querySelector("meta[name='theme-color']")
				?.setAttribute('content', $modeCurrent ? '#ffffff' : '#000000');
		}
	});

	afterNavigate((navigation) => {
		const searchParams = navigation.to?.url.searchParams;

		if (
			!searchParams?.has(deleteAccountSearchParameterName) &&
			!searchParams?.has(promoteAccountSearchParameterName) &&
			$modalStore[0]
		) {
			modalStore.close();
		}
	});
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

<AppBar background="bg-transparent" slotTrail="place-content-end">
	{#snippet trail()}
		<LightSwitch ring="ring-2 ring-surface-900-50-token" />
		<button
			type="button"
			class="btn-icon bg-transparent"
			onclick={() =>
				drawerStore.open({ id: drawerIds.navigation, position: 'right', regionDrawer: 'max-w-md' })}
			disabled={$loading}
		>
			<Bars />
			<span class="sr-only">Open navigation drawer</span>
		</button>
	{/snippet}
</AppBar>

<Drawer labelledby="drawer-label" duration={$prefersReducedMotion ? 0 : 200}>
	<NavigationDrawerContent />
	<SortDrawerContent />
</Drawer>

{@render children()}

<Modal duration={$prefersReducedMotion ? 0 : undefined} />

<style>
</style>
