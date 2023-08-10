import { test } from '@playwright/test';

export const skipTestOnWebkit = (browserName: string) => {
	test.skip(
		browserName === 'webkit',
		"Cross-domain iframe from localhost:5000 to localhost:9099 (for auth emulator) doesn't work in webkit"
	);
};
