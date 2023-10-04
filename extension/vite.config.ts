import path, { resolve } from 'path';
import { defineConfig } from 'vite';
import { forceInlineModule } from 'vite-plugin-force-inline-module';

import react from '@vitejs/plugin-react';

import manifest from './manifest';
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

// ENABLE HMR IN BACKGROUND SCRIPT
const enableHmrInBackgroundScript = true;

export default defineConfig({
	resolve: {
		alias: {
			'@root': rootDir,
			'@src': srcDir,
			'@assets': assetsDir,
			'@pages': pagesDir,
		},
	},
	plugins: [
		react(),
		makeManifest(manifest, {
			isDev,
			contentScriptCssKey: regenerateCacheInvalidationKey(),
		}),
		customDynamicImport(),
		addHmr({ background: enableHmrInBackgroundScript, view: true }),
		watchRebuild(),
		// FIXME: Works, but installed with --force flag, because of broken dependency.
		// Come up with a better solution.
		forceInlineModule({ inlineModules: ['run-log'] }),
	],
	publicDir,
	build: {
		outDir,
		/** Can slowDown build speed. */
		sourcemap: isDev,
		minify: isProduction,
		reportCompressedSize: isProduction,
		rollupOptions: {
			input: {
				devtools: resolve(pagesDir, 'devtools', 'index.html'),
				panel: resolve(pagesDir, 'panel', 'index.html'),
				'content-main': resolve(pagesDir, 'content', 'content-main.ts'),
				'content-isolated': resolve(pagesDir, 'content', 'content-isolated.ts'),
				background: resolve(pagesDir, 'background', 'index.ts'),
				contentStyle: resolve(pagesDir, 'content', 'style.scss'),
				popup: resolve(pagesDir, 'popup', 'index.html'),
				newtab: resolve(pagesDir, 'newtab', 'index.html'),
				options: resolve(pagesDir, 'options', 'index.html'),
			},
			output: {
				entryFileNames: 'src/pages/[name]/index.js',
				chunkFileNames: isDev ? 'assets/js/[name].js' : 'assets/js/[name].[hash].js',
				assetFileNames: (assetInfo) => {
					const { dir, name: _name } = path.parse(assetInfo.name ?? '');
					const assetFolder = dir.split('/').at(-1);
					const name = assetFolder + firstUpperCase(_name);
					if (name === 'contentStyle') {
						return `assets/css/contentStyle${cacheInvalidationKey}.chunk.css`;
					}
					return `assets/[ext]/${name}.chunk.[ext]`;
				},
			},
		},
	},
});

function firstUpperCase(str: string) {
	const firstAlphabet = new RegExp(/( |^)[a-z]/, 'g');
	return str.toLowerCase().replace(firstAlphabet, (L) => L.toUpperCase());
}

let cacheInvalidationKey: string = generateKey();
function regenerateCacheInvalidationKey() {
	cacheInvalidationKey = generateKey();
	return cacheInvalidationKey;
}

function generateKey(): string {
	return `${(Date.now() / 100).toFixed()}`;
}
