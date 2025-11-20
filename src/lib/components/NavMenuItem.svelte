<script lang="ts">
	import { page } from '$app/state';
	import preventDefaultIf from '$lib/helpers/preventDefaultIf';
	import { loading } from '$lib/stores/loading';
	import type { Snippet } from 'svelte';
	import type { TransitionConfig } from 'svelte/transition';

	let {
		href,
		nofollow = false,
		transition = () => {
			return {};
		},
		children,
		icon
	}: {
		href: string;
		nofollow?: boolean;
		transition?: (node: Element, ...params: unknown[]) => TransitionConfig;
		children: Snippet;
		icon: Snippet;
	} = $props();

	let classesActive = $derived(
		href === page.url.pathname
			? '!bg-surface-900-50-token !text-surface-50-900-token hover:!bg-surface-600-300-token'
			: '!bg-surface-100-800-token !text-surface-900-50-token hover:!bg-surface-200-700-token'
	);
</script>

<li class="!mt-0">
	<!-- eslint-disable svelte/no-navigation-without-resolve -->
	<a
		{href}
		class="focus:!outline-4 focus:!outline focus:!outline-surface-500 {classesActive}"
		class:opacity-50={$loading}
		class:cursor-not-allowed={$loading}
		onclick={(event) => preventDefaultIf(event, $loading)}
		transition:transition
		rel={nofollow ? 'nofollow' : undefined}
	>
		{@render icon()}
		<span class="flex-auto">
			{@render children()}
		</span>
	</a>
	<!-- eslint-enable svelte/no-navigation-without-resolve -->
</li>
