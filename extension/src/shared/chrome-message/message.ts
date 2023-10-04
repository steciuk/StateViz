import { ChromeMessage } from '@src/shared/chrome-message/events';

export function sendChromeMessage(message: ChromeMessage) {
	chrome.runtime.sendMessage(message);
}

export function onChromeMessage(callback: (message: ChromeMessage) => void) {
	chrome.runtime.onMessage.addListener(callback);
}

export function offChromeMessage(callback: (message: ChromeMessage) => void) {
	chrome.runtime.onMessage.removeListener(callback);
}
