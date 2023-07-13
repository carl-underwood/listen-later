<script lang="ts">
	import '../theme.postcss';
	import '@skeletonlabs/skeleton/styles/skeleton.css';
	import '../app.postcss';

	import { slide } from 'svelte/transition';
	import { page } from '$app/stores';
	import { AppBar, Drawer, drawerStore, LightSwitch, Modal } from '@skeletonlabs/skeleton';

	import { auth } from '$lib/stores/auth';
	import { user } from '$lib/stores/user';
	import { loading } from '$lib/stores/loading';
	import { prefersReducedMotion } from '$lib/stores/prefersReducedMotion';
	import Bars from '$lib/components/icons/bars.svelte';
	import Close from '$lib/components/icons/close.svelte';
	import Home from '$lib/components/icons/home.svelte';
	import NavMenuItem from '$lib/components/NavMenuItem.svelte';
	import Github from '$lib/components/icons/github.svelte';
	import Info from '$lib/components/icons/info.svelte';
	import ListMusic from '$lib/components/icons/list-music.svelte';
	import UserSettings from '$lib/components/icons/user-settings.svelte';

	$: {
		$page;
		drawerStore.close();
	}
</script>

<AppBar background="bg-transparent" slotTrail="place-content-end">
	<svelte:fragment slot="trail">
		<LightSwitch ring="ring-2 ring-primary-900-50-token" />
		<button
			type="button"
			class="btn-icon bg-transparent"
			on:click={() => drawerStore.open()}
			disabled={$loading}
		>
			<Bars />
			<span class="sr-only">Open navigation drawer</span>
		</button>
	</svelte:fragment>
</AppBar>

<Drawer
	position="right"
	labelledby="navigation-drawer-label"
	duration={$prefersReducedMotion ? 0 : 200}
	regionDrawer="max-w-md"
>
	<AppBar slotTrail="place-content-end">
		<svelte:fragment slot="trail">
			<button
				type="button"
				class="btn-icon bg-transparent"
				on:click={drawerStore.close}
				disabled={$loading}
			>
				<Close />
				<span class="sr-only">Close navigation drawer</span>
			</button>
		</svelte:fragment>
	</AppBar>
	<nav class="list-nav pt-8 px-8 flex flex-col">
		<span id="navigation-drawer-label" class="sr-only">Navigation drawer</span>
		<ul class="text-2xl flex flex-col gap-4">
			<NavMenuItem href="/">
				<Home slot="icon" />
				<svelte:fragment>Home</svelte:fragment>
			</NavMenuItem>
			<NavMenuItem href="/about">
				<Info slot="icon" />
				<svelte:fragment>About</svelte:fragment>
			</NavMenuItem>
			<NavMenuItem href="/list">
				<ListMusic slot="icon" />
				<svelte:fragment>List</svelte:fragment>
			</NavMenuItem>
			<NavMenuItem href="https://github.com/carl-hartshorn/listen-later">
				<Github slot="icon" />
				<svelte:fragment>GitHub</svelte:fragment>
			</NavMenuItem>
			{#if $user}
				<NavMenuItem href="/settings" transition={slide}>
					<UserSettings slot="icon" />
					<svelte:fragment>Settings</svelte:fragment>
				</NavMenuItem>
			{/if}
		</ul>
	</nav>
	{#if $user}
		<div class="my-8 flex justify-center">
			<button
				on:click={() => loading.whileAwaiting(auth.signOut)}
				disabled={$loading}
				class="btn variant-filled-error btn-2xl"
				transition:slide
			>
				Sign out
			</button>
		</div>
	{/if}
</Drawer>

<slot />

<Modal />
