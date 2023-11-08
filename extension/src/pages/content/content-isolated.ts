import {
	PostMessageBridge,
	PostMessageSource,
} from '@pages/content/shared/post-message';
import {
	ChromeMessageSource,
	ChromeMessageType,
} from '@src/shared/chrome-message/events';
import {
	onChromeMessage,
	sendChromeMessage,
} from '@src/shared/chrome-message/message';
import { runLog } from '@src/shared/run-log';

runLog('content-isolated.ts');

const postMessageBridge = PostMessageBridge.getInstance(
	PostMessageSource.ISOLATED
);

let react_attached = false;

postMessageBridge.onMessage((message) => {
	console.log('postMessageBridge.onMessage', message);
	if (message.content === 'REACT_ATTACHED') {
		react_attached = true;

		sendChromeMessage({
			type: ChromeMessageType.CREATE_DEVTOOLS_PANEL,
			source: ChromeMessageSource.CONTENT_SCRIPT,
		});
	}
});

onChromeMessage((message) => {
	console.log('onChromeMessage', message);
	console.log(react_attached);
	if (message.type === ChromeMessageType.IS_REACT_ATTACHED) {
		message.responseCallback(react_attached);
	}
});
