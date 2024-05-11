import {
	ChromeMessageSource,
	ChromeMessageType,
	onChromeMessage,
	sendChromeMessageToTab,
} from '@src/shared/chrome-messages/chrome-message';
import { Library } from '@src/shared/types/Library';

let panelCreated = false;

function createPanelIfNotCreated() {
	if (panelCreated) return;

	try {
		chrome.devtools.panels.create(
			'State-Viz',
			'/icons/enabled-32.png',
			'src/pages/panel/index.html'
		);
		panelCreated = true;
	} catch (e) {
		console.error(e);
	}
}

const currentTabId = chrome.devtools.inspectedWindow.tabId;

// Devtools window opened before library attached
const removeListener = onChromeMessage((message, sender) => {
	if (message.type === ChromeMessageType.LIBRARY_ATTACHED) {
		if (sender.tab?.id !== currentTabId) return;

		createPanelIfNotCreated();
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
				createPanelIfNotCreated();
			}
		},
	});
}

