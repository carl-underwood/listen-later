<script lang="ts">
	let {
		oneBasedReferenceNumber,
		goToReference
	}: {
		oneBasedReferenceNumber: number;
		goToReference: ({ oneBasedReferenceNumber }: { oneBasedReferenceNumber: number }) => void;
	} = $props();
</script>

<button class="underline" onclick={() => goToReference({ oneBasedReferenceNumber })}>
	[<span class="sr-only">see reference </span>{oneBasedReferenceNumber}]
</button>
