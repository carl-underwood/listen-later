const navigation = 'navigation';
const sort = 'sort';

export const drawerIds = {
	navigation,
	sort
} as const;

export type Drawers = keyof typeof drawerIds;
