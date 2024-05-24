import { defineConfig } from '@twind/core';
import presetAutoprefix from '@twind/preset-autoprefix';
import presetTailwind from '@twind/preset-tailwind';

export default defineConfig({
	presets: [presetAutoprefix(), presetTailwind()],
	theme: {
		colors: {
			text: 'var(--text)',
			background: 'var(--background)',
			primary: 'var(--primary)',
			secondary: 'var(--secondary)',
			'secondary-hover': 'var(--secondary-hover)',
			accent: 'var(--accent)',
			'text-disabled': 'var(--text-disabled)',
			disabled: 'var(--disabled)',
		},
	},
});

