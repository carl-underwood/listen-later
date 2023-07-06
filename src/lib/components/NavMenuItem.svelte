<script lang="ts">
	import { page } from '$app/stores';
	import type { TransitionConfig } from 'svelte/transition';

	export let href: string;

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	export let transition: (node: Element, ...params: any[]) => TransitionConfig = () => {
		return {};
	};

	$: classesActive = href === $page.url.pathname ? '!bg-primary-500' : '';
</script>

<li>
	<a {href} class={classesActive} transition:transition>
		<slot name="icon" />
		<span class="flex-auto"><slot /></span>
	</a>
</li>
