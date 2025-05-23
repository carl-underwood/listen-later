<script>
	import { loading } from '$lib/stores/loading';
	import Google from './icons/Google.svelte';

	let { onclick } = $props();
</script>

<button
	disabled={$loading}
	class="btn bg-surface-900-50-token text-surface-50-900-token flex gap-2"
	{onclick}
>
	<Google classes="w-6 h-6" />
	<span>Sign in with Google</span>
</button>
