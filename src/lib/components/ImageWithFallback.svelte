<script lang="ts">
	import { tick, type Snippet } from 'svelte';

	type Image = {
		src: string;
		alt?: string;
	};

	let {
		imagesInOrderOfPrecedence,
		classes = undefined,
		finalFallback
	}: {
		imagesInOrderOfPrecedence: Image[];
		classes?: string | undefined;
		finalFallback: Snippet;
	} = $props();

	let attemptIndex = $state(0);

	// This is required as Chrome (for example) only runs the `onerror` once
	// so in order for our second, third, etc. fallbacks to be attempted we have
	// rip out the `img` and render it again.
	let renderImage = $state(true);

	const forceImageRerender = async () => {
		renderImage = false;
		await tick();
		renderImage = true;
	};

	const tryNextImage = () => {
		attemptIndex++;
		forceImageRerender();
	};
</script>

{#if renderImage && attemptIndex < imagesInOrderOfPrecedence.length}
	<img
		src={imagesInOrderOfPrecedence[attemptIndex].src}
		alt={imagesInOrderOfPrecedence[attemptIndex].alt}
		onerror={tryNextImage}
		loading="lazy"
		class={classes}
	/>
{/if}
{#if attemptIndex >= imagesInOrderOfPrecedence.length}
	{@render finalFallback()}
{/if}
