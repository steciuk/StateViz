import 'webextension-polyfill';

import reloadOnUpdate from 'virtual:reload-on-update-in-background-script';
import {
	ChromeMessageType,
	onChromeMessage,
} from '@src/shared/chrome/chrome-message';

reloadOnUpdate('pages/background');

/**
 * Extension reloading is necessary because the browser automatically caches the css.
 * If you do not use the css of the content script, please delete it.
 */
reloadOnUpdate('pages/content/style.scss');

console.log('background loaded');

onChromeMessage((message, sender) => {
	if (message.type === ChromeMessageType.LIBRARY_ATTACHED) {
		// set extension icon
		chrome.action.setIcon({
			path: {
				32: '/icons/enabled-32.png',
				24: '/icons/enabled-24.png',
				16: '/icons/enabled-16.png',
			},
			tabId: sender.tab?.id,
		});
	}
});

