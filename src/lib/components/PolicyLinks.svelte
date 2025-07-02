<script lang="ts">
	type PolicyLink = {
		name: string;
		href: string;
	};

	let { policyLinks }: { policyLinks: PolicyLink[] } = $props();
</script>

<div class="flex justify-center items-center gap-2">
	{#each policyLinks as policyLink, i (policyLink.href)}
		<a href={policyLink.href} class="underline"><small>{policyLink.name}</small></a>
		{#if i !== policyLinks.length - 1}
			<span class="divider-vertical border-surface-950-50 m-0 h-4"></span>
		{/if}
	{/each}
</div>
