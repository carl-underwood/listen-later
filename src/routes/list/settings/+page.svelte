<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { type ModalSettings, getModalStore } from '@skeletonlabs/skeleton';
	import DeleteAccountModal from '$lib/components/DeleteAccountModal.svelte';
	import PromoteAccountAlert from '$lib/components/PromoteAccountAlert.svelte';
	import PromoteAccountModal from '$lib/components/PromoteAccountModal.svelte';
	import { user } from '$lib/stores/user';
	import {
		deleteAccountSearchParameterName,
		promoteAccountSearchParameterName
	} from './searchParameters';

	const modalStore = getModalStore();

	$: if ($page.url.searchParams.get(deleteAccountSearchParameterName) === 'true') {
		showModal(deleteAccountModal);
	} else if ($page.url.searchParams.get(promoteAccountSearchParameterName) === 'true') {
		showModal(promoteAccountModal);
	}

	$: if ($modalStore[0] !== deleteAccountModal && $modalStore[0] !== promoteAccountModal) {
		goto('/list/settings', { replaceState: true });
	}

	const deleteAccountModal: ModalSettings = {
		type: 'component',
		component: {
			ref: DeleteAccountModal
		}
	};

	const promoteAccountModal: ModalSettings = {
		type: 'component',
		component: {
			ref: PromoteAccountModal
		}
	};

	const promoteAccount = () =>
		goto(`/list/settings?${promoteAccountSearchParameterName}=true`, { replaceState: true });

	const deleteAccount = () =>
		goto(`/list/settings?${deleteAccountSearchParameterName}=true`, { replaceState: true });

	const showModal = (modalSettings: ModalSettings) => {
		if ($modalStore[0]) {
			return;
		}

		modalStore.trigger(modalSettings);
	};
</script>

<h1 class="sr-only">Settings</h1>
<div id="settings-container" class="flex flex-col gap-4">
	{#if $user?.isAnonymous}
		<PromoteAccountAlert>
			<svelte:fragment slot="signInButton">
				<button
					class="btn bg-surface-900-50-token text-surface-50-900-token"
					on:click={promoteAccount}
				>
					Sign in
				</button>
			</svelte:fragment>
		</PromoteAccountAlert>
	{/if}

	<div class="flex flex-col gap-4 ring-4 ring-surface-900-50-token mt-1 mb-1 p-4">
		<h2 class="h2">Spotify</h2>
		<p>
			Listen Later currently only supports searching Spotify for songs etc. available to the
			<strong>United Kingdom</strong> market. This means that if your Spotify account "Country or region"
			is not "United Kingdom", items added to your Listen Later list may not necessarily be available
			in your region.
		</p>
		<p>
			We aim to introduce best-effort market detection and manual selection at a later date. Please
			see the <a href="/about#roadmap" class="underline">Roadmap</a> for more details.
		</p>
	</div>

	<div class="flex flex-col items-center justify-end grow">
		<button on:click={deleteAccount} class="btn variant-filled-error btn-2xl">
			Delete account
		</button>
	</div>
</div>

<style>
	#settings-container {
		min-height: calc(100vh - (4.6875rem + 1rem)); /* Top bar + bottom padding */
		min-height: calc(100svh - (4.6875rem + 1rem)); /* Top bar + bottom padding */
	}
</style>
