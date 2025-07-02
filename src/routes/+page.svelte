<script lang="ts">
	import ListenLater from '$lib/components/ListenLater.svelte';
	import searchDark from '../assets/search-dark.png';
	import searchLight from '../assets/search-light.png';
	import listDark from '../assets/list-dark.png';
	import listLight from '../assets/list-light.png';
	import ArrowDown from '$lib/components/icons/arrow-down.svelte';
	import { browser } from '$app/environment';
	import GoToReferenceButton from '$lib/components/GoToReferenceButton.svelte';
	import Roadmap from '$lib/components/Roadmap.svelte';

	let scrollY: number = $state(0);

	let percentageScrolled = $derived(
		!browser ? 0 : scrollY / (document.body.scrollHeight - window.innerHeight) || 0
	);

	type Reference = {
		href: string;
		description: string;
	};

	const references: Reference[] = [
		{
			href: 'https://community.spotify.com/t5/Your-Library/Listen-to-Later/td-p/5376172',
			description: 'Listen to Later - The Spotify Community'
		},
		{
			href: 'https://community.spotify.com/t5/Live-Ideas/Your-Library-Listen-later-Button/idi-p/4510092',
			description: "[Your Library] 'Listen later' Button - The Spotify Community"
		},
		{
			href: 'https://www.reddit.com/r/spotify/comments/r7pg0j/i_wish_spotify_had_a_listen_later_option/',
			description: 'I wish Spotify had a “listen later” option. : r/spotify'
		},
		{
			href: 'https://twitter.com/SpotifyNews/status/1328337031282520064',
			description:
				'Spotify News on Twitter: "Found a podcast episode you want to save for later? Now you can with Your Episodes. Head to Your Library to find everything you’ve bookmarked and get listening. 🎧'
		}
	];

	let referenceRefs: HTMLAnchorElement[] = [];

	const goToReference = (event: { oneBasedReferenceNumber: number }) => {
		referenceRefs[event.oneBasedReferenceNumber - 1].focus();
	};
</script>

<svelte:window bind:scrollY />

<div>
	<div
		class="flex flex-col items-center gap-4 px-2 pt-4 pb-8 max-w-4xl mx-auto xl:flex-row xl:items-start xl:justify-center xl:gap-8 xl:max-w-none"
	>
		<div
			class="p-4 bg-surface-50-950 border-4 border-surface-950-50 w-max max-w-[90%] mx-auto flex flex-col gap-4 xl:mx-4 xl:sticky xl:top-8"
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
				class="border-4 border-surface-950-50 shadow-lg"
				style:transform={`translateZ(-1000px) translateY(${Math.min(
					percentageScrolled * 20,
					100
				)}%) rotateY(-90deg) skewY(-20deg) rotateY(70deg)`}
			/>
			<img
				id="list-screenshot"
				src={$modeCurrent ? listLight : listDark}
				alt="Screenshot of the Listen Later list page"
				class="border-4 border-surface-950-50 shadow-lg"
				style:transform={`translateZ(-800px) translateY(-${Math.min(
					percentageScrolled * 20,
					100
				)}%) rotateY(90deg) skewY(20deg) rotateY(-70deg)`}
			/>
		</div>
		<div class="flex flex-col gap-4 items-center px-4 xl:self-end xl:sticky xl:bottom-8">
			<a href="/list" class="btn bg-surface-950-50 text-surface-50-950">Try it out</a>
		</div>
	</div>

	<div class="max-w-2xl mx-auto p-4">
		<div class="flex flex-col gap-4">
			<p>
				Heard about an artist you want to listen to? Or a podcast that has peaked your interest?
				Listen Later allows you to curate a list of albums, artists, episodes, podcasts and songs to
				listen to later with Spotify.
			</p>
			<p>
				Born out of the desire to be able to easily keep track of things to listen to later
				<GoToReferenceButton oneBasedReferenceNumber={1} {goToReference} />
				<GoToReferenceButton oneBasedReferenceNumber={2} {goToReference} />
				<GoToReferenceButton oneBasedReferenceNumber={3} {goToReference} />
				(which Spotify currently only supports for podcast episodes <GoToReferenceButton
					oneBasedReferenceNumber={4}
					{goToReference}
				/>), Listen Later is a free to use, ad-free and open-source web application built to solve
				this problem.
			</p>
			<div class="flex gap-4">
				<div>
					<img
						src={$modeCurrent ? searchLight : searchDark}
						alt="Screenshot of the Listen Later search page"
						class="border-4 border-surface-950-50 max-w-[100%]"
					/>
				</div>
				<div>
					<img
						src={$modeCurrent ? listLight : listDark}
						alt="Screenshot of the Listen Later list page"
						class="border-4 border-surface-950-50"
					/>
				</div>
			</div>
			<p>
				To get started, sign in (or try it out as a guest), search for an item from Spotify's
				extensive library, and add it to your list. As your list is stored in the cloud, you can
				access it on other devices by simply signing in.
			</p>
			<div class="flex justify-center">
				<a href="/list" class="btn bg-surface-950-50 text-surface-50-950">Try it out</a>
			</div>
			<hr class="!border-t-2 my-4" />
			<Roadmap />
			<hr class="!border-t-2 my-4" />
			<div>
				<h2 class="h2 mb-2">References</h2>
				<ul>
					{#each references as reference, i (reference.href)}
						<li class="flex gap-2">
							<span class="shrink-0">[<span class="sr-only">Reference </span>{i + 1}]</span>
							<a href={reference.href} class="underline reference" bind:this={referenceRefs[i]}>
								{reference.description}
							</a>
						</li>
					{/each}
				</ul>
			</div>
		</div>
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

	.reference:focus {
		outline-color: rgb(var(--color-surface-400));
		outline-style: solid;
		outline-width: var(--theme-border-base);
	}
</style>
