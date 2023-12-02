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
	PostMessageSource.ISOLATED,
);

const chromeBridge = new ChromeBridgeListener(
	ChromeBridgeConnection.PANEL_TO_CONTENT,
	() => {
		console.log('connection from devtools panel established');
		if (currentFibers.size === 0) return;
		chromeBridge.send({
			type: ChromeBridgeMessageType.FULL_SKELETON,
			content: Array.from(currentFibers.values()),
		});
	},
);

let react_attached = false;
const currentFibers: Map<NodeId, ParsedFiber> = new Map();

postMessageBridge.onMessage((message) => {
	// console.log('onMessage', message);
	if (message.type === PostMessageType.REACT_ATTACHED) {
		react_attached = true;

		// Send message to devtools panel that react is attached, devtools panel potentially opened before react attached
		sendChromeMessage({
			type: ChromeMessageType.CREATE_DEVTOOLS_PANEL,
			source: ChromeMessageSource.CONTENT_SCRIPT,
		});
	} else if (message.type === PostMessageType.MOUNT_NODES) {
		console.log('MOUNT_NODES', message.content);
		message.content.forEach((mountNode) => {
			const pathFromRoot = mountNode.pathFromRoot;
			if (pathFromRoot.length === 0) {
				currentFibers.set(mountNode.node.id, mountNode.node);
			} else {
				const [rootId, ...restOfPath] = pathFromRoot;
				const root = currentFibers.get(rootId);
				if (!root) {
					console.error('root not found');
					return;
				}

				let current = root;
				for (const nodeId of restOfPath) {
					const child = current.children.find((child) => child.id === nodeId);
					if (!child) {
						console.error('child not found');
						return;
					}
					current = child;
				}
				if (mountNode.afterNode === null) {
					current.children.splice(0, 0, mountNode.node);
				} else {
					const afterNodeIndex = current.children.findIndex(
						(child) => child.id === mountNode.afterNode,
					);
					if (afterNodeIndex === -1) {
						console.error('afterNode not found');
					} else {
						current.children.splice(afterNodeIndex + 1, 0, mountNode.node);
					}
				}
			}
		});

		if (chromeBridge.isConnected) {
			chromeBridge.send({
				type: ChromeBridgeMessageType.FULL_SKELETON,
				content: Array.from(currentFibers.values()),
			});
		}
	} else if (message.type === PostMessageType.UNMOUNT_NODES) {
		console.log('UNMOUNT_NODES', message.content);
		const [rootId, ...restOfPath] = message.content;
		if (restOfPath.length === 0) {
			currentFibers.delete(rootId);
		} else {
			const root = currentFibers.get(rootId);
			if (!root) {
				console.error('root not found');
				return;
			}

			let current = root;
			for (let i = 0; i < restOfPath.length - 1; i++) {
				const child = current.children.find(
					(child) => child.id === restOfPath[i],
				);
				if (!child) {
					console.error('node on path not found');
					return;
				}

				current = child;
			}

			const nodeId = restOfPath[restOfPath.length - 1];
			const childIndex = current.children.findIndex(
				(child) => child.id === nodeId,
			);
			if (childIndex === -1) {
				console.error('node not found');
				return;
			}
			current.children.splice(childIndex, 1);
		}

		if (chromeBridge.isConnected) {
			chromeBridge.send({
				type: ChromeBridgeMessageType.FULL_SKELETON,
				content: Array.from(currentFibers.values()),
			});
		}
	} else if (message.type === PostMessageType.INSPECTED_DATA) {
		console.log('INSPECTED_DATA', message.content);
		if (chromeBridge.isConnected) {
			chromeBridge.send({
				type: ChromeBridgeMessageType.INSPECTED_DATA,
				content: message.content,
			});
		}
	}
});

chromeBridge.onMessage((message) => {
	if (message.type === ChromeBridgeMessageType.INSPECT_ELEMENT) {
		postMessageBridge.send({
			type: PostMessageType.INSPECT_ELEMENT,
			content: message.content,
		});
	}
});

// Devtools panel asks if react is attached, devtools panel opened after react attached
onChromeMessage((message) => {
	if (message.type === ChromeMessageType.IS_REACT_ATTACHED) {
		console.log(
			'question from devtools panel: is react attached?',
			react_attached,
		);
		message.responseCallback(react_attached);
	}
});
