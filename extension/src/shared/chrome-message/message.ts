import {
	ChromeMessage,
	OmitFromUnion,
} from '@src/shared/chrome-message/events';

export function sendChromeMessage(
	message: OmitFromUnion<ChromeMessage, 'sender'>
) {
	message?.responseCallback
		? chrome.runtime.sendMessage(message, message.responseCallback)
		: chrome.runtime.sendMessage(message);
}

export function onChromeMessage(
	callback: (message: OmitFromUnion<ChromeMessage, 'sender'>) => void
) {
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
