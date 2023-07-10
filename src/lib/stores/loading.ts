import { writable } from 'svelte/store';

function createLoading() {
	const { subscribe, set } = writable<boolean>(false);

	const whileAwaiting = async (action: () => Promise<unknown>) => {
		set(true);
		await action();
		set(false);
	};

	return { subscribe, whileAwaiting };
}

export const loading = createLoading();
