<script lang="ts">
	const fireEmail = () => {
		const href = 'mailto:hello@listenlater.cloud';
		const link = document.createElement('a');
		link.href = href;
		link.target = '_blank';
		link.click();
	};
</script>

<div class="max-w-2xl mx-auto p-4">
	<div class="flex flex-col gap-4">
		<h1 class="h1">Contact</h1>
		<p>Need to get in touch?</p>
		<p>
			For bugs, please visit <a
				href="https://github.com/carl-hartshorn/listen-later/issues"
				class="underline">Listen Later Issues on GitHub</a
			>.
		</p>
		<p>
			For feature requests, ideas & suggestions, please visit <a
				href="https://github.com/carl-hartshorn/listen-later/discussions"
				class="underline">Listen Later Discussions on GitHub</a
			>.
		</p>
		<p>
			For anything else, <button class="underline" on:click={fireEmail}>drop us an email</button>.
		</p>
	</div>
</div>
