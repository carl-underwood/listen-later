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
		transition?: (node: Element, ...params: any[]) => TransitionConfig;
		children: Snippet;
		icon: Snippet;
	} = $props();

	let classesActive = $derived(
		href === page.url.pathname
			? '!bg-surface-950-50 !text-surface-50-950 hover:!bg-surface-700-300'
			: '!bg-surface-100-900 !text-surface-950-50 hover:!bg-surface-200-800'
	);
</script>

<li class="!mt-0">
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
</li>
