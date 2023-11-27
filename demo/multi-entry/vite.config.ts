import path, { resolve } from 'path';
import { defineConfig } from 'vite';
import { inlineImports } from 'vite-plugin-inline-imports';

export default defineConfig({
	resolve: {
		alias: {
			src: path.resolve('src/'),
		},
	},
	plugins: [
		inlineImports({
			rules: [
				{
					for: [/entry1/, /entry2/],
					inline: [/shared/],
				},
			],
		}),
	],
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
