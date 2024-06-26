import { Library } from '@src/shared/types/Library';

export enum ChromeMessageType {
	LIBRARY_ATTACHED = 'LIBRARY_ATTACHED',
	WHAT_LIBRARIES_ATTACHED = 'WHAT_LIBRARIES_ATTACHED',
	COMMIT_ROOT = 'COMMIT_ROOT',
}

export enum ChromeMessageSource {
	CONTENT_SCRIPT = 'CONTENT',
	DEVTOOLS = 'DEVTOOLS',
	POPUP = 'POPUP',
}

export type ChromeMessage =
	| LibraryAttachedChromeMessage
	| WhatLibrariesAttachedChromeMessage;

// devtools script / popup -> content-isolated on specific tab
export type WhatLibrariesAttachedChromeMessage = {
	type: ChromeMessageType.WHAT_LIBRARIES_ATTACHED;
	source: ChromeMessageSource.DEVTOOLS | ChromeMessageSource.POPUP;
	responseCallback: (librariesAttached: Library[]) => void;
};

// content-isolated -> devtools script / background script
export type LibraryAttachedChromeMessage = {
	type: ChromeMessageType.LIBRARY_ATTACHED;
	source: ChromeMessageSource.CONTENT_SCRIPT;
	content: Library;
	responseCallback?: undefined;
};

// FUNCTIONS
export function sendChromeMessage(message: ChromeMessage): void {
	message?.responseCallback
		? chrome.runtime.sendMessage(message, message.responseCallback)
		: chrome.runtime.sendMessage(message);
}

export function sendChromeMessageToTab(
	tabId: number,
	message: ChromeMessage
): void {
	message?.responseCallback
		? chrome.tabs.sendMessage(tabId, message, message.responseCallback)
		: chrome.tabs.sendMessage(tabId, message);
}

export function onChromeMessage(
	callback: (
		message: ChromeMessage,
		sender: chrome.runtime.MessageSender
	) => void
): () => void {
	const eventHandler: Parameters<
		typeof chrome.runtime.onMessage.addListener
	>[0] = (message, sender, responseCallback) => {
		callback(
			{
				...message,
				responseCallback,
			},
			sender
		);
	};

	chrome.runtime.onMessage.addListener(eventHandler);

	return () => {
		chrome.runtime.onMessage.removeListener(eventHandler);
	};
}

