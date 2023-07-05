<script>
	import { page } from '$app/stores';
</script>

<h1 class="h1">{$page.status} {$page.error?.message}</h1>
