import { ParsedReactNode } from '@src/shared/types/ParsedNode';

import { OmitFromUnion, WithRequired } from '../utility-types';
import { Library } from '@src/shared/types/Library';

export enum ChromeMessageType {
	LIBRARY_ATTACHED = 'LIBRARY_ATTACHED',
	IS_LIBRARY_ATTACHED = 'IS_LIBRARY_ATTACHED',
	COMMIT_ROOT = 'COMMIT_ROOT',
}

export enum ChromeMessageSource {
	CONTENT_SCRIPT = 'CONTENT',
	DEVTOOLS = 'DEVTOOLS',
}

export type ChromeMessage =
	| LibraryAttachedChromeMessage
	| IsLibraryAttachedChromeMessage;

// BASE TYPES
type ChromeMessageBase = {
	sender: chrome.runtime.MessageSender;
	responseCallback?: undefined;
};
type ContentScriptChromeMessage = Omit<ChromeMessageBase, 'sender'> & {
	sender: WithRequired<chrome.runtime.MessageSender, 'tab'>;
	source: ChromeMessageSource.CONTENT_SCRIPT;
};

// SPECIFIC TYPES
// content-isolated -> devtools script / background script
export type LibraryAttachedChromeMessage = ContentScriptChromeMessage & {
	type: ChromeMessageType.LIBRARY_ATTACHED;
	content: Library;
};

// devtools script -> content-isolated on specific tab
export type IsLibraryAttachedChromeMessage = Omit<
	ChromeMessageBase,
	'responseCallback'
> & {
	type: ChromeMessageType.IS_LIBRARY_ATTACHED;
	source: ChromeMessageSource.DEVTOOLS;
	responseCallback: (isReactAttached: boolean) => void;
};

// FUNCTIONS
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

