import type { SortOrder } from '$lib/types/SortOrder';
import { writable } from 'svelte/store';

export const sortOrder = writable<SortOrder>('addedAtUtcDescending');
