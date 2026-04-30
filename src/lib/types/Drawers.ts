const navigation = 'navigation';
const sort = 'sort';
const filter = 'filter';

export const drawerIds = {
	navigation,
	sort,
	filter
} as const;

export type Drawers = keyof typeof drawerIds;
