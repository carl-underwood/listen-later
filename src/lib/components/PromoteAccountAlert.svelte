<script lang="ts">
	import { slide } from 'svelte/transition';
	import { prefersReducedMotion } from '$lib/stores/prefersReducedMotion';

	const slideWithPrefersReducedMotion = (node: Element) =>
		slide(node, { duration: $prefersReducedMotion ? 0 : undefined });
</script>

<div
	role="alert"
	class="alert variant-filled-error ring-4 ring-surface-900-50-token mt-1 mb-5"
	transition:slideWithPrefersReducedMotion
>
	<div class="alert-message">
		<span class="h3">Sign in to keep your list</span>
		<p>You're currently trying out Listen Later as a guest.</p>
		<p>
			<strong>
				Please note that when trying out Listen Later without an account your list won't be
				available on other browsers / devices, and could be lost entirely (e.g. if browsing data is
				cleared). As such, it's recommended to create a full account if you wish to continue using
				Listen Later after trying it out.
			</strong>
		</p>
	</div>
	<div class="alert-actions">
		<slot name="signInButton" />
	</div>
</div>
