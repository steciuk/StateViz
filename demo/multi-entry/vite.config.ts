import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
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
