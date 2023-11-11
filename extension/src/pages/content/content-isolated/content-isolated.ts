import {
	PostMessageBridge,
	PostMessageSource,
	PostMessageType,
} from '@pages/content/shared/PostMessageBridge';
import {
	ChromeMessageSource,
	ChromeMessageType,
	onChromeMessage,
	sendChromeMessage,
} from '@src/shared/chrome-messages/chrome-message';
import {
	ChromeBridgeConnection,
	ChromeBridgeListener,
	ChromeBridgeMessageType,
} from '@src/shared/chrome-messages/ChromeBridge';
import { runLog } from '@src/shared/run-log';

runLog('content-isolated.ts');

const postMessageBridge = PostMessageBridge.getInstance(
	PostMessageSource.ISOLATED
);

const chromeBridge = new ChromeBridgeListener(
	ChromeBridgeConnection.PANEL_TO_CONTENT
);
chromeBridge.connect(() => {
	console.warn('chromeBridge connected');
});

let react_attached = false;

postMessageBridge.onMessage((message) => {
	console.log('onMessage', message);
	switch (message.type) {
		case PostMessageType.REACT_ATTACHED:
			react_attached = true;

			sendChromeMessage({
				type: ChromeMessageType.CREATE_DEVTOOLS_PANEL,
				source: ChromeMessageSource.CONTENT_SCRIPT,
			});
			break;

		case PostMessageType.COMMIT_ROOT:
			if (chromeBridge.isConnected) {
				chromeBridge.send({
					type: ChromeBridgeMessageType.COMMIT_ROOT,
					content: message.content,
				});
			}
			break;

		default:
			break;
	}
});

onChromeMessage((message) => {
	console.log('onChromeMessage', message);
	console.log(react_attached);
	if (message.type === ChromeMessageType.IS_REACT_ATTACHED) {
		message.responseCallback(react_attached);
	}
});
