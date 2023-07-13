<script lang="ts">
	import { page } from '$app/stores';
	import { loading } from '$lib/stores/loading';
	import type { TransitionConfig } from 'svelte/transition';

	export let href: string;

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	export let transition: (node: Element, ...params: any[]) => TransitionConfig = () => {
		return {};
	};

	$: classesActive =
		href === $page.url.pathname
			? '!bg-surface-900-50-token !text-surface-50-900-token hover:!bg-surface-600-300-token'
			: '!bg-surface-100-800-token !text-surface-900-50-token hover:!bg-surface-200-700-token';

	const preventDefaultIfLoading = (event: Event) => {
		if ($loading) {
			event.preventDefault();
		}
	};
</script>

<li class="!mt-0">
	<a
		{href}
		class="focus:!outline-4 focus:!outline focus:!outline-surface-500 {classesActive}"
		class:opacity-50={$loading}
		class:cursor-not-allowed={$loading}
		on:click={preventDefaultIfLoading}
		transition:transition
	>
		<slot name="icon" />
		<span class="flex-auto"><slot /></span>
	</a>
</li>
