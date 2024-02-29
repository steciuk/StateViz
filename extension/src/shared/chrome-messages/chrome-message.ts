import { ParsedFiber } from '@src/shared/types/ParsedFiber';

import { OmitFromUnion, WithRequired } from '../utility-types';

export enum ChromeMessageType {
	CREATE_DEVTOOLS_PANEL = 'CREATE_DEVTOOLS_PANEL',
	IS_REACT_ATTACHED = 'IS_REACT_ATTACHED',
	COMMIT_ROOT = 'COMMIT_ROOT',
}

export enum ChromeMessageSource {
	CONTENT_SCRIPT = 'CONTENT',
	DEVTOOLS = 'DEVTOOLS',
	PANEL = 'PANEL',
	BACKGROUND_SCRIPT = 'BACKGROUND',
	POPUP = 'POPUP',
}

export type ChromeMessage =
	| CreateDevtoolsPanelChromeMessage
	| IsReactAttachedChromeMessage
	| CommitRootChromeMessage;

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
// content-isolated -> devtools script
export type CreateDevtoolsPanelChromeMessage = ContentScriptChromeMessage & {
	type: ChromeMessageType.CREATE_DEVTOOLS_PANEL;
};

// content-isolated -> devtools script
export type CommitRootChromeMessage = ContentScriptChromeMessage & {
	type: ChromeMessageType.COMMIT_ROOT;
	content: ParsedFiber;
};

// devtools script -> content-isolated on specific tab
export type IsReactAttachedChromeMessage = Omit<
	ChromeMessageBase,
	'responseCallback'
> & {
	type: ChromeMessageType.IS_REACT_ATTACHED;
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
