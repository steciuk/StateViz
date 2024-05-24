/// <reference types="vitest" />
import path, { resolve } from 'path';
import { defineConfig } from 'vite';
import { inlineImports } from 'vite-plugin-inline-imports';

import react from '@vitejs/plugin-react';

import addHmr from './utils/plugins/add-hmr';
import customDynamicImport from './utils/plugins/custom-dynamic-import';
import makeManifest from './utils/plugins/make-manifest';
import watchRebuild from './utils/plugins/watch-rebuild';

const rootDir = resolve(__dirname);
const srcDir = resolve(rootDir, 'src');
const pagesDir = resolve(srcDir, 'pages');
const assetsDir = resolve(srcDir, 'assets');
const outDir = resolve(rootDir, 'dist');
const publicDir = resolve(rootDir, 'public');

const isDev = process.env.__DEV__ === 'true';
const isProduction = !isDev;
const isVitest = process.env.VITEST === 'true';

// ENABLE HMR IN BACKGROUND SCRIPT
const enableHmrInBackgroundScript = true;
const cacheInvalidationKeyRef = { current: generateKey() };

export default defineConfig({
	resolve: {
		alias: {
			'@pages': pagesDir,
			'@assets': assetsDir,
			'@src': srcDir,
			'@root': rootDir,
		},
	},
	define: {
		VERSION: JSON.stringify(process.env.npm_package_version),
		IS_PROD: isProduction,
	},
	plugins: [
		makeManifest({
			getCacheInvalidationKey,
		}),
		react(),
		customDynamicImport(),
		addHmr({ background: enableHmrInBackgroundScript, view: true }),
		isDev && watchRebuild({ afterWriteBundle: regenerateCacheInvalidationKey }),
		!isVitest &&
			inlineImports({
				rules: [
					{
						for: [/src\/pages\/content\/.*\.ts/],
						inline: [
							/src\/shared\/.*\.ts/,
							/src\/pages\/content\/shared\/.*\.ts/,
						],
					},
					{
						for: [/src\/.*\.ts/],
						inline: [/src\/shared\/utils\/console\.ts/],
					},
				],
			}),
	],
	publicDir,
	build: {
		outDir,
		/** Can slow down build speed. */
		sourcemap: isDev,
		minify: isProduction,
		modulePreload: false,
		reportCompressedSize: isProduction,
		emptyOutDir: !isDev,
		rollupOptions: {
			input: {
				devtools: resolve(pagesDir, 'devtools', 'index.html'),
				panel: resolve(pagesDir, 'panel', 'index.html'),
				'content-main': resolve(
					pagesDir,
					'content',
					'content-main',
					'content-main.ts'
				),
				'content-isolated': resolve(
					pagesDir,
					'content',
					'content-isolated',
					'content-isolated.ts'
				),
				background: resolve(pagesDir, 'background', 'index.ts'),
				contentStyle: resolve(pagesDir, 'content', 'style.scss'),
				popup: resolve(pagesDir, 'popup', 'index.html'),
				// newtab: resolve(pagesDir, 'newtab', 'index.html'),
				// options: resolve(pagesDir, 'options', 'index.html'),
				// sidepanel: resolve(pagesDir, 'sidepanel', 'index.html'),
			},
			output: {
				entryFileNames: 'src/pages/[name]/index.js',
				chunkFileNames: isDev
					? 'assets/js/[name].js'
					: 'assets/js/[name].[hash].js',
				assetFileNames: (assetInfo) => {
					const { name } = path.parse(assetInfo.name!);
					const assetFileName =
						name === 'contentStyle'
							? `${name}${getCacheInvalidationKey()}`
							: name;
					return `assets/[ext]/${assetFileName}.chunk.[ext]`;
				},
			},
		},
	},
	test: {
		globals: true,
		environment: 'jsdom',
		include: ['**/*.test.ts', '**/*.test.tsx'],
		setupFiles: './test-utils/vitest.setup.js',
		coverage: {
			reporter: ['json-summary'],
			include: [
				'src/shared/chrome/*.ts',
				'src/shared/utils/*.ts',
				'src/pages/**/*.ts',
			],
			// TODO: add tsx when tests done
			exclude: [
				'src/**/index.ts',
				'src/pages/content/content-main/content-main.ts',
				'src/pages/content/content-isolated/content-isolated.ts',
			],
		},
	},
});

function getCacheInvalidationKey() {
	return cacheInvalidationKeyRef.current;
}
function regenerateCacheInvalidationKey() {
	cacheInvalidationKeyRef.current = generateKey();
	return cacheInvalidationKeyRef;
}

function generateKey(): string {
	return `${Date.now().toFixed()}`;
}

