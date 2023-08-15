<script lang="ts">
	import ListenLater from '$lib/components/ListenLater.svelte';
	import searchDark from '../assets/search-dark.png';
	import searchLight from '../assets/search-light.png';
	import listDark from '../assets/list-dark.png';
	import listLight from '../assets/list-light.png';
	import { modeCurrent } from '@skeletonlabs/skeleton';
	import ArrowDown from '$lib/components/icons/arrow-down.svelte';
	import { browser } from '$app/environment';

	let scrollY: number;

	$: percentageScrolled = !browser
		? 0
		: scrollY / (document.body.scrollHeight - window.innerHeight) || 0;
</script>

<svelte:window bind:scrollY />

<div
	class="flex flex-col items-center gap-4 px-2 pt-4 pb-8 max-w-4xl mx-auto xl:flex-row xl:items-start xl:justify-center xl:gap-8 xl:max-w-none"
>
	<div
		class="p-4 bg-surface-50-900-token border-4 border-surface-900-50-token w-max max-w-[90%] mx-auto flex flex-col gap-4 xl:mx-4 xl:sticky xl:top-8"
	>
		<ListenLater classes="max-w-sm" />
		<h1 class="h1">Listen Later</h1>
	</div>
	<ArrowDown classes="w-6 h-6 my-4 motion-safe:animate-bounce xl:hidden" />
	<div class="relative py-6 mx-auto w-full max-w-lg xl:mx-4">
		<img
			id="search-screenshot"
			src={$modeCurrent ? searchLight : searchDark}
			alt="Screenshot of the Listen Later search page"
			class="border-4 border-surface-900-50-token shadow-lg"
			style:transform={`translateZ(-1000px) translateY(${Math.min(
				percentageScrolled * 10,
				100
			)}%) rotateY(-90deg) skewY(-20deg) rotateY(70deg)`}
		/>
		<img
			id="list-screenshot"
			src={$modeCurrent ? listLight : listDark}
			alt="Screenshot of the Listen Later list page"
			class="border-4 border-surface-900-50-token shadow-lg"
			style:transform={`translateZ(-800px) translateY(-${Math.min(
				percentageScrolled * 10,
				100
			)}%) rotateY(90deg) skewY(20deg) rotateY(-70deg)`}
		/>
	</div>
	<div class="flex flex-col gap-4 items-center xl:self-end xl:sticky xl:bottom-8">
		<a href="/list" class="btn bg-surface-900-50-token text-surface-50-900-token">Try it out</a>
		<a href="/about" class="btn variant-soft">Learn more</a>
	</div>
</div>

<style>
	#search-screenshot {
		max-width: 60%;
	}

	#list-screenshot {
		max-width: 60%;
		margin-left: auto;
	}
</style>
