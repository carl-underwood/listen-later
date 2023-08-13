<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { type ModalSettings, modalStore } from '@skeletonlabs/skeleton';
	import DeleteAccountModal from '$lib/components/DeleteAccountModal.svelte';
	import PromoteAccountAlert from '$lib/components/PromoteAccountAlert.svelte';
	import PromoteAccountModal from '$lib/components/PromoteAccountModal.svelte';
	import { user } from '$lib/stores/user';
	import {
		deleteAccountSearchParameterName,
		promoteAccountSearchParameterName
	} from './searchParameters';

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
<div
	id="settings-container"
	class="pb-8 flex flex-col gap-4 min-h-[calc(100vh - 4rem)] min-h-[calc(100svh - 4rem)]"
>
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

	<div class="grow" />

	<div class="flex flex-col items-center gap-4">
		<button on:click={deleteAccount} class="btn variant-filled-error btn-2xl">
			Delete account
		</button>
	</div>
</div>

<style>
	#settings-container {
		min-height: calc(100svh - 6.75rem);
	}
</style>
