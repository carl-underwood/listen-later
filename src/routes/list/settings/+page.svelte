<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import DeleteAccountModal from '$lib/components/DeleteAccountModal.svelte';
	import PromoteAccountModal from '$lib/components/PromoteAccountModal.svelte';
	import { type ModalSettings, modalStore } from '@skeletonlabs/skeleton';

	$: if ($page.url.searchParams.get('deleteAccount') === 'true') {
		showModal(deleteAccountModal);
	} else if ($page.url.searchParams.get('promoteAccount') === 'true') {
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

	const deleteAccount = () => goto('/list/settings?deleteAccount=true', { replaceState: true });

	const showModal = (modalSettings: ModalSettings) => {
		if ($modalStore[0]) {
			return;
		}

		modalStore.trigger(modalSettings);
	};
</script>

<div class="pb-8 flex justify-center">
	<button on:click={deleteAccount} class="btn variant-filled-error btn-2xl">
		Delete account
	</button>
</div>
