import path, { resolve } from 'path';
import { defineConfig } from 'vite';
import { inlineCode } from 'vite-plugin-inline-code';

export default defineConfig({
	resolve: {
		alias: {
			src: path.resolve('src/'),
		},
	},
	plugins: [inlineCode(['shared'])],
	build: {
		outDir: resolve(__dirname, 'dist'),
		rollupOptions: {
			input: {
				entry1: resolve(__dirname, 'src/entry1.ts'),
				entry2: resolve(__dirname, 'src/entry2.ts'),
			},
		},
	},
});
