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
import { ParsedFiber } from '@src/shared/types/ParsedFiber';

runLog('content-isolated.ts');

const postMessageBridge = PostMessageBridge.getInstance(
	PostMessageSource.ISOLATED
);

const chromeBridge = new ChromeBridgeListener(
	ChromeBridgeConnection.PANEL_TO_CONTENT
);
chromeBridge.connect(() => {
	console.log('connection from devtools panel established');
	if (!parsedFiber) return;
	chromeBridge.send({
		type: ChromeBridgeMessageType.FULL_SKELETON,
		content: parsedFiber,
	});
});

let react_attached = false;
let parsedFiber: ParsedFiber | null = null;

postMessageBridge.onMessage((message) => {
	// console.log('onMessage', message);
	switch (message.type) {
		case PostMessageType.REACT_ATTACHED:
			react_attached = true;

			// Send message to devtools panel that react is attached, devtools panel potentially opened before react attached
			sendChromeMessage({
				type: ChromeMessageType.CREATE_DEVTOOLS_PANEL,
				source: ChromeMessageSource.CONTENT_SCRIPT,
			});
			break;

		case PostMessageType.COMMIT_ROOT:
			parsedFiber = message.content;
			if (chromeBridge.isConnected) {
				// TODO: Don't send full skeleton, only updates on commit
				chromeBridge.send({
					type: ChromeBridgeMessageType.FULL_SKELETON,
					content: message.content,
				});
			}
			break;

		default:
			break;
	}
});

// Devtools panel asks if react is attached, devtools panel opened after react attached
onChromeMessage((message) => {
	if (message.type === ChromeMessageType.IS_REACT_ATTACHED) {
		console.log(
			'question from devtools panel: is react attached?',
			react_attached
		);
		message.responseCallback(react_attached);
	}
});
