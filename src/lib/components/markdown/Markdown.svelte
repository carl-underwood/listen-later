<script lang="ts">
	import type { TokensList } from 'marked';
	import GithubSlugger from 'github-slugger';

	const slugger = new GithubSlugger();

	let { baseHeading = 1, tokens }: { baseHeading?: number; tokens: TokensList } = $props();

	$effect(() => {
		const unsupportedTokenTypes = tokens
			.filter(
				(token) =>
					token.type !== 'heading' &&
					token.type !== 'paragraph' &&
					token.type !== 'space' &&
					token.type !== 'text' &&
					token.type !== 'link' &&
					token.type !== 'list' &&
					token.type !== 'list_item'
			)
			.map((token) => token.type)
			.filter((tokenType, index, array) => index === array.indexOf(tokenType));

		if (unsupportedTokenTypes.length) {
			throw Error(
				`Encountered token types that Markdown.svelte does not currently support: [${unsupportedTokenTypes.join(
					', '
				)}]`
			);
		}
	});
</script>

<!-- Horrible formatting here required to avoid whitespace issues! -->
{#each tokens as token}{#if token.type === 'space'}<br
		/>{/if}{#if token.type === 'text'}{token.raw}{/if}{#if token.type === 'heading'}<svelte:element
			this={`h${token.depth + (baseHeading - 1)}`}
			id={slugger.slug(token.text)}
			class={`h${token.depth + (baseHeading - 1)}`}
			><svelte:self tokens={token.tokens} {baseHeading} /></svelte:element
		>{/if}{#if token.type === 'paragraph'}<p>
			<svelte:self tokens={token.tokens} {baseHeading} />
		</p>{/if}{#if token.type === 'link'}<a href={token.href} class="underline"
			><svelte:self tokens={token.tokens} {baseHeading} /></a
		>{/if}{#if token.type === 'list'}<ul>
			<svelte:self tokens={token.items} {baseHeading} />
		</ul>{/if}{#if token.type === 'list_item'}<li>
			<svelte:self tokens={token.tokens} {baseHeading} />
		</li>{/if}{/each}

<style>
	h2,
	h3,
	h4,
	h5,
	h6 {
		margin-bottom: 0.5rem;
	}

	ul {
		position: relative;
		margin-left: 2rem;
	}

	li:before {
		content: '-';
		position: absolute;
		left: -1rem;
		transform: translateX(-50%);
	}
</style>
