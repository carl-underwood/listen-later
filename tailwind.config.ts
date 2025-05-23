import { join } from 'path';
import type { Config } from 'tailwindcss';

import tailwindforms from '@tailwindcss/forms';

const config = {
	// 2. Opt for dark mode to be handled via the class method
	darkMode: 'class',
	content: [
		'./src/**/*.{html,js,svelte,ts}',
		// 3. Append the path to the Skeleton package
		join(require.resolve('@skeletonlabs/skeleton'), '../**/*.{html,js,svelte,ts}')
	],
	theme: {
		extend: {}
	},
	plugins: [tailwindforms]
} satisfies Config;

export default config;
