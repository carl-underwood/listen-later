export const addedAtUtcAscending = 'addedAtUtcAscending';
export const addedAtUtcDescending = 'addedAtUtcDescending';

export const sortOrders = [addedAtUtcAscending, addedAtUtcDescending] as const;

// See https://stackoverflow.com/a/62900613
export type SortOrder = (typeof sortOrders)[number];
