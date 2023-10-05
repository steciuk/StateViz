import { resolve } from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
	build: {
		lib: {
			entry: resolve(__dirname, 'src/index.ts'),
			name: 'vite-plugin-inline-code',
			fileName: 'vite-plugin-inline-code',
		},
	},
	plugins: [dts()],
});
