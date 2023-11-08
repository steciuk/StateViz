import { ChromeMessage } from '@src/shared/chrome-message/events';

import { OmitFromUnion } from '../utility-types';

export function sendChromeMessage(
	message: OmitFromUnion<ChromeMessage, 'sender'>
) {
	message?.responseCallback
		? chrome.runtime.sendMessage(message, message.responseCallback)
		: chrome.runtime.sendMessage(message);
}

export function sendChromeMessageToTab(
	tabId: number,
	message: OmitFromUnion<ChromeMessage, 'sender'>
) {
	message?.responseCallback
		? chrome.tabs.sendMessage(tabId, message, message.responseCallback)
		: chrome.tabs.sendMessage(tabId, message);
}

export function onChromeMessage(callback: (message: ChromeMessage) => void) {
	const eventHandler: Parameters<
		typeof chrome.runtime.onMessage.addListener
	>[0] = (message, sender, responseCallback) => {
		callback({
			...message,
			sender,
			responseCallback,
		});
	};

	chrome.runtime.onMessage.addListener(eventHandler);

	return () => {
		chrome.runtime.onMessage.removeListener(eventHandler);
	};
}
