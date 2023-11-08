import {
	ChromeMessageSource,
	ChromeMessageType,
} from '@src/shared/chrome-message/events';
import {
	onChromeMessage,
	sendChromeMessageToTab,
} from '@src/shared/chrome-message/message';
import { runLog } from '@src/shared/run-log';

runLog('devtools.ts');

function createPanel() {
	try {
		chrome.devtools.panels.create(
			'Dev Tools',
			'icon-34.png',
			'src/pages/panel/index.html'
		);
	} catch (e) {
		console.error(e);
	}
}

let panelCreated = false;
const currentTabId = chrome.devtools.inspectedWindow.tabId;

// Devtools window opened before react attached
const removeListener = onChromeMessage((message) => {
	if (message.type === ChromeMessageType.CREATE_DEVTOOLS_PANEL) {
		if (panelCreated) return;
		if (message.sender.tab.id !== currentTabId) return;

		panelCreated = true;
		createPanel();
		removeListener();
	}
});

// Devtools window opened after react attached
if (!panelCreated) {
	sendChromeMessageToTab(currentTabId, {
		type: ChromeMessageType.IS_REACT_ATTACHED,
		source: ChromeMessageSource.DEVTOOLS,
		responseCallback: (isReactAttached) => {
			if (isReactAttached) {
				panelCreated = true;
				createPanel();
			}
		},
	});
}
