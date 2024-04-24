import {
	ChromeMessageSource,
	ChromeMessageType,
	onChromeMessage,
	sendChromeMessageToTab,
} from '@src/shared/chrome-messages/chrome-message';
import { runLog } from '@src/shared/run-log';

runLog('devtools.ts');

function createPanel() {
	try {
		chrome.devtools.panels.create(
			'State-Viz',
			'/icons/enabled-32.png',
			'src/pages/panel/index.html'
		);
	} catch (e) {
		console.error(e);
	}
}

let panelCreated = false;
const currentTabId = chrome.devtools.inspectedWindow.tabId;

// Devtools window opened before library attached
const removeListener = onChromeMessage((message) => {
	if (message.type === ChromeMessageType.LIBRARY_ATTACHED) {
		console.warn('Library attached in DEVTOOLS', message.content);
		if (panelCreated) return;
		if (message.sender.tab.id !== currentTabId) return;

		panelCreated = true;
		createPanel();
		removeListener();
	}
});

// Devtools window opened after library attached
if (!panelCreated) {
	sendChromeMessageToTab(currentTabId, {
		type: ChromeMessageType.IS_LIBRARY_ATTACHED,
		source: ChromeMessageSource.DEVTOOLS,
		responseCallback: (isLibraryAttached) => {
			if (isLibraryAttached) {
				if (panelCreated) return;
				panelCreated = true;
				createPanel();
			}
		},
	});
}

