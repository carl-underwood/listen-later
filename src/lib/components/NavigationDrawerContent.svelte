<script lang="ts">
	import { slide } from 'svelte/transition';
	import { version } from '$app/environment';
	import { AppBar, getDrawerStore } from '@skeletonlabs/skeleton';

	import { auth } from '$lib/stores/auth';
	import { user } from '$lib/stores/user';
	import { loading } from '$lib/stores/loading';
	import { prefersReducedMotion } from '$lib/stores/prefersReducedMotion';
	import Close from '$lib/components/icons/close.svelte';
	import NavMenuItem from '$lib/components/NavMenuItem.svelte';
	import Home from '$lib/components/icons/home.svelte';
	import ListMusic from '$lib/components/icons/list-music.svelte';
	import Github from '$lib/components/icons/github.svelte';
	import Envelope from '$lib/components/icons/envelope.svelte';
	import UserSettings from '$lib/components/icons/user-settings.svelte';
	import PolicyLinks from '$lib/components/PolicyLinks.svelte';
	import { drawerIds } from '$lib/types/Drawers';

	const drawerStore = getDrawerStore();

	const slideWithPrefersReducedMotion = (node: Element) =>
		slide(node, { duration: $prefersReducedMotion ? 0 : undefined });
</script>

{#if $drawerStore.id === drawerIds.navigation}
	<div id="navigation-drawer-inner" class="flex flex-col">
		<div class="grow">
			<AppBar slotTrail="place-content-end">
				{#snippet trail()}
					<button
						type="button"
						class="btn-icon bg-transparent"
						onclick={drawerStore.close}
						disabled={$loading}
					>
						<Close />
						<span class="sr-only">Close navigation drawer</span>
					</button>
				{/snippet}
			</AppBar>
			<nav class="list-nav p-8 flex flex-col">
				<span id="drawer-label" class="sr-only">Navigation drawer</span>
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
						class="btn variant-filled-error btn-2xl"
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
{/if}

<style>
	#navigation-drawer-inner {
		min-height: 100vh;
		min-height: 100dvh;
	}
</style>
