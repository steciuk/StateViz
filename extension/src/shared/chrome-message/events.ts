import { ParsedFiber } from '@src/shared/types/ParsedFiber';
import { WithRequired } from '@src/shared/utility-types';

export type ChromeMessage =
	| CreateDevtoolsPanelChromeMessage
	| IsReactAttachedChromeMessage
	| CommitRootChromeMessage;

export enum ChromeMessageSource {
	CONTENT_SCRIPT = 'CONTENT',
	DEVTOOLS = 'DEVTOOLS',
	PANEL = 'PANEL',
	BACKGROUND_SCRIPT = 'BACKGROUND',
	POPUP = 'POPUP',
}

export enum ChromeMessageType {
	CREATE_DEVTOOLS_PANEL = 'CREATE_DEVTOOLS_PANEL',
	IS_REACT_ATTACHED = 'IS_REACT_ATTACHED',
	COMMIT_ROOT = 'COMMIT_ROOT',
}

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
type CreateDevtoolsPanelChromeMessage = ContentScriptChromeMessage & {
	type: ChromeMessageType.CREATE_DEVTOOLS_PANEL;
};

// content-isolated -> devtools script
type CommitRootChromeMessage = ContentScriptChromeMessage & {
	type: ChromeMessageType.COMMIT_ROOT;
	content: ParsedFiber;
};

// devtools script -> content-isolated on specific tab
type IsReactAttachedChromeMessage = Omit<
	ChromeMessageBase,
	'responseCallback'
> & {
	type: ChromeMessageType.IS_REACT_ATTACHED;
	source: ChromeMessageSource.DEVTOOLS;
	responseCallback: (isReactAttached: boolean) => void;
};
