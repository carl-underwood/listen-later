<script lang="ts">
	import { tick } from 'svelte';

	type Image = {
		src: string;
		alt?: string;
	};

	export let imagesInOrderOfPrecedence: Image[];
	export let classes: string | undefined = undefined;

	let attemptIndex = 0;

	// This is required as Chrome (for example) only runs the `onerror` once
	// so in order for our second, third, etc. fallbacks to be attempted we have
	// rip out the `img` and render it again.
	let renderImage = true;

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
		on:error={tryNextImage}
		loading="lazy"
		class={classes}
	/>
{/if}
{#if attemptIndex >= imagesInOrderOfPrecedence.length}
	<slot name="finalFallback" />
{/if}
