<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import DeleteAccountModal from '$lib/components/DeleteAccountModal.svelte';
	import { type ModalSettings, modalStore } from '@skeletonlabs/skeleton';

	$: if ($page.url.searchParams.get('deleteAccount') === 'true') {
		showDeleteAccountModal();
	}

	$: if ($modalStore[0] !== deleteAccountModal) {
		goto('/list/settings', { replaceState: true });
	}

	const deleteAccountModal: ModalSettings = {
		type: 'component',
		component: {
			ref: DeleteAccountModal
		}
	};

	const deleteAccount = () => {
		goto('/list/settings?deleteAccount=true', { replaceState: true });
	};

	const showDeleteAccountModal = () => {
		modalStore.trigger(deleteAccountModal);
	};
</script>

<div class="pb-8 flex justify-center">
	<button on:click={deleteAccount} class="btn variant-filled-error btn-2xl">
		Delete account
	</button>
</div>
