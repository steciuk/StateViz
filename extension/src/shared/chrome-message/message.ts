import { ChromeMessage } from '@src/shared/chrome-message/events';

// FIXME: If imported in more than one 'page' it is chunkified
// and cannot be imported in content-script, find a way to inline
// it everywhere it is used
// WORKAROUND: duplicated code in @pages/content/utils/chrome-message
export function sendChromeMessage(message: ChromeMessage) {
	chrome.runtime.sendMessage(message);
}

export function onChromeMessage(callback: (message: ChromeMessage) => void) {
	chrome.runtime.onMessage.addListener(callback);
}

export function offChromeMessage(callback: (message: ChromeMessage) => void) {
	chrome.runtime.onMessage.removeListener(callback);
}
