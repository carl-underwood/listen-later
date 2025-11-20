<script lang="ts">
	import { resolve } from '$app/paths';

	type PolicyLink = {
		name: string;
		href: '/terms-of-use' | '/privacy-policy';
	};

	let { policyLinks }: { policyLinks: PolicyLink[] } = $props();
</script>

<div class="flex justify-center items-center gap-2">
	{#each policyLinks as policyLink, i (policyLink.href)}
		<a href={resolve(policyLink.href)} class="underline"><small>{policyLink.name}</small></a>
		{#if i !== policyLinks.length - 1}
			<span class="divider-vertical border-surface-900-50-token m-0 h-4"></span>
		{/if}
	{/each}
</div>
