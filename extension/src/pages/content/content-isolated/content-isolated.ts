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
import { NodeId, ParsedFiber } from '@src/shared/types/ParsedFiber';

runLog('content-isolated.ts');

const postMessageBridge = PostMessageBridge.getInstance(
	PostMessageSource.ISOLATED
);

const chromeBridge = new ChromeBridgeListener(
	ChromeBridgeConnection.PANEL_TO_CONTENT
);
chromeBridge.connect(() => {
	console.log('connection from devtools panel established');
	if (currentFibers.size === 0) return;
	chromeBridge.send({
		type: ChromeBridgeMessageType.FULL_SKELETON,
		content: Array.from(currentFibers.values()),
	});
});

let react_attached = false;
const currentFibers: Map<NodeId, ParsedFiber> = new Map();

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

		case PostMessageType.MOUNT_NODES:
			console.log('MOUNT_NODES', message.content);
			message.content.forEach((mountNode) => {
				const pathFromRoot = mountNode.pathFromRoot;
				if (pathFromRoot.length === 0) {
					currentFibers.set(mountNode.node.id, mountNode.node);
				} else {
					const root = currentFibers.get(pathFromRoot[0]);
					if (root) {
						let current = root;
						for (let i = 1; i < pathFromRoot.length; i++) {
							const child = current.children.find(
								(child) => child.id === pathFromRoot[i]
							);
							if (!child) {
								console.error('child not found');
								break;
							}
							current = child;
						}
						if (mountNode.afterNode === null) {
							current.children.splice(0, 0, mountNode.node);
						} else {
							const afterNodeIndex = current.children.findIndex(
								(child) => child.id === mountNode.afterNode
							);
							if (afterNodeIndex === -1) {
								console.error('afterNode not found');
							} else {
								current.children.splice(afterNodeIndex + 1, 0, mountNode.node);
							}
						}
					} else {
						console.error('root not found');
					}
				}
			});
			if (chromeBridge.isConnected) {
				chromeBridge.send({
					type: ChromeBridgeMessageType.FULL_SKELETON,
					content: Array.from(currentFibers.values()),
				});
			}
			break;
		case PostMessageType.UNMOUNT_NODES:
			console.log('UNMOUNT_NODES', message.content);
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
