<script lang="ts">
	import { Lexer } from 'marked';
	import roadmapMarkdown from '../../../ROADMAP.md?raw';
	import Markdown from './markdown/Markdown.svelte';

	const lexer = new Lexer();

	$: tokens = lexer.lex(roadmapMarkdown);
</script>

<div class="roadmap">
	<Markdown {tokens} baseHeading={2} />
</div>
