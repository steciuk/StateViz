export type ChromeMessage =
	| CreateDevtoolsPanelChromeMessage
	| IsReactAttachedChromeMessage;

// TODO: move to shared utility types
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type OmitFromUnion<T, K extends keyof T> = T extends any
	? Omit<T, K>
	: never;

export enum ChromeMessageType {
	CREATE_DEVTOOLS_PANEL = 'CREATE_DEVTOOLS_PANEL',
	IS_REACT_ATTACHED = 'IS_REACT_ATTACHED',
}

export enum ChromeMessageSource {
	CONTENT_SCRIPT = 'CONTENT',
	DEVTOOLS = 'DEVTOOLS',
	PANEL = 'PANEL',
	BACKGROUND_SCRIPT = 'BACKGROUND',
	POPUP = 'POPUP',
}

// BASE TYPES

type ChromeMessageBase = {
	sender: chrome.runtime.MessageSender;
	responseCallback?: (response?: any) => void;
};

type ContentScriptChromeMessage = Omit<ChromeMessageBase, 'sender'> & {
	sender: chrome.runtime.MessageSender &
		Required<Pick<chrome.runtime.MessageSender, 'tab'>>;
	source: ChromeMessageSource.CONTENT_SCRIPT;
};

// SPECIFIC TYPES

type CreateDevtoolsPanelChromeMessage = ContentScriptChromeMessage & {
	type: ChromeMessageType.CREATE_DEVTOOLS_PANEL;
};

type IsReactAttachedChromeMessage = Omit<
	ChromeMessageBase,
	'responseCallback'
> & {
	type: ChromeMessageType.IS_REACT_ATTACHED;
	source: ChromeMessageSource.DEVTOOLS;
	responseCallback: (isReactAttached: boolean) => void;
};
