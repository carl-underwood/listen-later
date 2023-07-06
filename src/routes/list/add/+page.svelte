<script lang="ts">
	import { goto } from '$app/navigation';
	import { createForm } from 'svelte-forms-lib';
	import { object, string } from 'yup';

	import { items } from '$lib/stores/items';
	import { loading } from '$lib/stores/loading';
	import type Item from '$lib/types/Item';

	$: $items;

	const { form, errors, handleSubmit } = createForm({
		initialValues: {
			id: ''
		},
		validationSchema: object().shape({
			id: string().required()
		}),
		onSubmit: async (values) => {
			const item: Item = {
				id: values.id,
				addedAtUtc: new Date().toISOString(),
				listened: false,
				metadata: [],
				name: values.id,
				spotifyUrl: '',
				type: 'album'
			};

			await loading.whileAwaiting(() => items.upsertItem(item));
			goToListPage();
		}
	});

	const goToListPage = () => goto('/list');
</script>

<form on:submit={handleSubmit}>
	<label class="label">
		<span>id</span>
		<input
			name="id"
			class="input"
			class:input-error={$errors.id}
			type="text"
			placeholder="id"
			bind:value={$form.id}
			disabled={$loading}
		/>
	</label>
	<small role={$errors.id ? 'alert' : ''}>{$errors.id}</small>
	<button
		class="btn bg-gradient-to-br variant-gradient-secondary-tertiary"
		type="submit"
		disabled={$loading}
	>
		Add
	</button>
	<button class="btn variant-soft" type="button" disabled={$loading} on:click={goToListPage}>
		Cancel
	</button>
</form>
