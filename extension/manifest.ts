/* eslint-disable @typescript-eslint/ban-ts-comment */
import packageJson from './package.json';

/**
 * After changing, please reload the extension at `chrome://extensions`
 */
const manifest: chrome.runtime.ManifestV3 = {
	manifest_version: 3,
	name: packageJson.name,
	version: packageJson.version,
	description: packageJson.description,
	permissions: ['storage'],
	host_permissions: ['<all_urls>'],
	options_page: 'src/pages/options/index.html',
	background: {
		service_worker: 'src/pages/background/index.js',
		type: 'module',
	},
	action: {
		default_popup: 'src/pages/popup/index.html',
		default_icon: 'icon-34.png',
	},
	// chrome_url_overrides: {
	//   newtab: "src/pages/newtab/index.html",
	// },
	icons: {
		'128': 'icon-128.png',
	},
	content_scripts: [
		{
			matches: ['http://*/*', 'https://*/*', '<all_urls>'],
			js: ['src/pages/content-main/index.js'],
			// KEY for cache invalidation
			css: ['assets/css/contentStyle<KEY>.chunk.css'],
			run_at: 'document_start',
			// @ts-ignore
			world: 'MAIN',
		},
		{
			matches: ['http://*/*', 'https://*/*', '<all_urls>'],
			js: ['src/pages/content-isolated/index.js'],
			run_at: 'document_start',
			// @ts-ignore
			world: 'ISOLATED',
		},
	],
	devtools_page: 'src/pages/devtools/index.html',
	web_accessible_resources: [
		{
			resources: ['assets/js/*.js', 'assets/css/*.css', 'icon-128.png', 'icon-34.png'],
			matches: ['*://*/*'],
		},
	],
};

export default manifest;
