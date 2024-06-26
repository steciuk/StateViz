import {
	ChromeMessageSource,
	ChromeMessageType,
	onChromeMessage,
	sendChromeMessageToTab,
} from '@src/shared/chrome/chrome-message';
import { Library } from '@src/shared/types/Library';
import { consoleError } from '@src/shared/utils/console';

let panelCreated = false;

function createPanelIfNotCreated() {
	if (panelCreated) return;

	try {
		chrome.devtools.panels.create(
			'StateViz',
			'/icons/enabled-32.png',
			'src/pages/panel/index.html'
		);
		panelCreated = true;
	} catch (e) {
		consoleError(e);
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
	try {
		sendChromeMessageToTab(currentTabId, {
			type: ChromeMessageType.WHAT_LIBRARIES_ATTACHED,
			source: ChromeMessageSource.DEVTOOLS,
			responseCallback: (librariesAttached: Library[]) => {
				if (librariesAttached.length > 0) {
					createPanelIfNotCreated();
				}
			},
		});
	} catch (e) {
		consoleError(e);
	}
}

