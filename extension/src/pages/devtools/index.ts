import {
	ChromeMessageSource,
	ChromeMessageType,
	onChromeMessage,
	sendChromeMessageToTab,
} from '@src/shared/chrome-messages/chrome-message';
import { runLog } from '@src/shared/run-log';
import { Library } from '@src/shared/types/Library';

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
const removeListener = onChromeMessage((message, sender) => {
	if (message.type === ChromeMessageType.LIBRARY_ATTACHED) {
		console.warn('Library attached in DEVTOOLS', message.content);
		if (panelCreated) return;
		if (sender.tab?.id !== currentTabId) return;

		panelCreated = true;
		createPanel();
		removeListener();
	}
});

// Devtools window opened after a library attached
if (!panelCreated) {
	sendChromeMessageToTab(currentTabId, {
		type: ChromeMessageType.WHAT_LIBRARIES_ATTACHED,
		source: ChromeMessageSource.DEVTOOLS,
		responseCallback: (librariesAttached: Library[]) => {
			if (librariesAttached.length > 0) {
				if (panelCreated) return;
				panelCreated = true;
				createPanel();
			}
		},
	});
}

