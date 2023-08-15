<script lang="ts">
	import GoToReferenceButton from '$lib/components/GoToReferenceButton.svelte';
	import { modeCurrent } from '@skeletonlabs/skeleton';
	import searchDark from '../../assets/search-dark.png';
	import searchLight from '../../assets/search-light.png';
	import listDark from '../../assets/list-dark.png';
	import listLight from '../../assets/list-light.png';
	import Roadmap from '$lib/components/Roadmap.svelte';

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

	const goToReference = (event: CustomEvent<{ oneBasedReferenceNumber: number }>) => {
		referenceRefs[event.detail.oneBasedReferenceNumber - 1].focus();
	};
</script>

<div class="max-w-2xl mx-auto p-4">
	<div class="flex flex-col gap-4">
		<h1 class="h1">About</h1>
		<p>
			Heard about an artist you want to listen to? Or a podcast that has peaked your interest?
			Listen Later allows you to curate a list of albums, artists, episodes, podcasts and songs to
			listen to later with Spotify.
		</p>
		<p>
			Born out of the desire to be able to easily keep track of things to listen to later
			<GoToReferenceButton oneBasedReferenceNumber={1} on:goToReference={goToReference} />
			<GoToReferenceButton oneBasedReferenceNumber={2} on:goToReference={goToReference} />
			<GoToReferenceButton oneBasedReferenceNumber={3} on:goToReference={goToReference} />
			(which Spotify currently only supports for podcast episodes <GoToReferenceButton
				oneBasedReferenceNumber={4}
				on:goToReference={goToReference}
			/>), Listen Later is a free to use and open source web application built to solve this
			problem.
		</p>
		<div class="flex gap-4">
			<div>
				<img
					src={$modeCurrent ? searchLight : searchDark}
					alt="Screenshot of the Listen Later search page"
					class="border-4 border-surface-900-50-token max-w-[100%]"
				/>
			</div>
			<div>
				<img
					src={$modeCurrent ? listLight : listDark}
					alt="Screenshot of the Listen Later list page"
					class="border-4 border-surface-900-50-token"
				/>
			</div>
		</div>
		<p>
			To get started, sign in (or try it out as a guest), search for an item from Spotify's
			extensive library, and add it to your list. As your list is stored in the cloud, you can
			access it on other devices by simply signing in.
		</p>
		<div class="flex justify-center">
			<a href="/list" class="btn bg-surface-900-50-token text-surface-50-900-token">Try it out</a>
		</div>
		<hr class="!border-t-4 my-4" />
		<Roadmap />
		<hr class="!border-t-4 my-4" />
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

<style>
	.reference:focus {
		outline-color: rgb(var(--color-surface-400));
		outline-style: solid;
		outline-width: var(--theme-border-base);
	}
</style>
