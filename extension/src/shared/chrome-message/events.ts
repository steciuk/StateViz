export type ChromeMessage = ReactAttachedChromeMessage;

export enum ChromeMessageType {
	REACT_ATTACHED = 'REACT_ATTACHED',
	REACT_DETACHED = 'REACT_DETACHED',
}

export enum ChromeMessageSource {
	CONTENT_SCRIPT = 'CONTENT_SCRIPT',
	DEVTOOLS_PANEL = 'DEVTOOLS',
	BACKGROUND_SCRIPT = 'BACKGROUND_SCRIPT',
	POPUP = 'POPUP',
}

type ReactAttachedChromeMessage = {
	source: ChromeMessageSource.CONTENT_SCRIPT;
	type: ChromeMessageType.REACT_ATTACHED;
};
