import packageJson from './package.json' assert { type: 'json' };

/**
 * After changing, please reload the extension at `chrome://extensions`
 * @type {chrome.runtime.ManifestV3}
 */
const manifest = {
	manifest_version: 3,
	name: packageJson.name,
	version: packageJson.version,
	description: packageJson.description,
	permissions: [
    'storage', 
    // 'sidePanel'
  ],
	// side_panel: {
	// 	default_path: 'src/pages/sidepanel/index.html',
	// },
	// options_page: 'src/pages/options/index.html',
	background: {
		service_worker: 'src/pages/background/index.js',
		type: 'module',
	},
	action: {
		default_popup: 'src/pages/popup/index.html',
		default_icon: 'disabled-32.png',
	},
	// chrome_url_overrides: {
	//   newtab: "src/pages/newtab/index.html",
	// },
	icons: {
		128: 'enabled-128.png',
	},
	content_scripts: [
		{
			matches: ['http://*/*', 'https://*/*', '<all_urls>'],
			js: ['src/pages/content-main/index.js'],
			// KEY for cache invalidation
			// TODO: uncomment, when using styles in content script
			// css: ['assets/css/contentStyle<KEY>.chunk.css'],
			run_at: 'document_start',
			world: 'MAIN',
		},
		{
			matches: ['http://*/*', 'https://*/*', '<all_urls>'],
			js: ['src/pages/content-isolated/index.js'],
			run_at: 'document_start',
			world: 'ISOLATED',
		},
	],
	devtools_page: 'src/pages/devtools/index.html',
	web_accessible_resources: [
		{
			resources: [
				'assets/js/*.js',
				'assets/css/*.css',
				'enabled-128.png',
				'enabled-32.png',
        'disabled-128.png',
			],
			matches: ['*://*/*'],
		},
	],
};

export default manifest;
