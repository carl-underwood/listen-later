<script>
	import { loading } from '$lib/stores/loading';
	import Apple from './icons/Apple.svelte';
</script>

<button
	disabled={$loading}
	class="btn bg-surface-900-50-token text-surface-50-900-token flex gap-2"
	on:click
>
	<Apple classes="w-6 h-6" />
	<span>Sign in with Apple</span>
</button>
