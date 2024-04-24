import 'webextension-polyfill';

import reloadOnUpdate from 'virtual:reload-on-update-in-background-script';
import {
	ChromeMessageType,
	onChromeMessage,
} from '@src/shared/chrome-messages/chrome-message';

reloadOnUpdate('pages/background');

/**
 * Extension reloading is necessary because the browser automatically caches the css.
 * If you do not use the css of the content script, please delete it.
 */
reloadOnUpdate('pages/content/style.scss');

console.log('background loaded');

onChromeMessage((message) => {
	if (message.type === ChromeMessageType.LIBRARY_ATTACHED) {
		// set extension icon
		console.warn('Library attached in BACKGROUND', message.content);
		chrome.action.setIcon({
			path: {
				32: '/icons/enabled-32.png',
				128: '/icons/enabled-128.png',
			},
			tabId: message.sender.tab.id,
		});
	}
});

