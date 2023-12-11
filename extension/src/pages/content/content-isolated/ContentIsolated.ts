import {
	InspectedDataPostMessage,
	MountNodesPostMessage,
	PostMessageBridge,
	PostMessageSource,
	PostMessageType,
	ReactAttachedPostMessage,
	UnmountNodesPostMessage,
} from '@pages/content/shared/PostMessageBridge';
import {
	ChromeMessageSource,
	ChromeMessageType,
	IsReactAttachedChromeMessage,
	onChromeMessage,
	sendChromeMessage,
} from '@src/shared/chrome-messages/chrome-message';
import {
	ChromeBridgeConnection,
	ChromeBridgeListener,
	ChromeBridgeMessage,
	ChromeBridgeMessageType,
	InspectElementBridgeMessage,
} from '@src/shared/chrome-messages/ChromeBridge';
import { NodeId, ParsedFiber } from '@src/shared/types/ParsedFiber';

export class ContentIsolated {
	private static instance: ContentIsolated | undefined;
	private postMessageBridge: PostMessageBridge;
	private chromeBridge: ChromeBridgeListener;
	private reactAttached: boolean = false;
	private currentFibers: Map<NodeId, ParsedFiber> = new Map();

	private constructor() {
		this.postMessageBridge = PostMessageBridge.getInstance(
			PostMessageSource.ISOLATED
		);
		this.chromeBridge = new ChromeBridgeListener(
			ChromeBridgeConnection.PANEL_TO_CONTENT,
			() => {
				this.handleDevtoolsPanelConnection();
			}
		);

		this.setupListeners();
	}

	static initialize(): ContentIsolated {
		if (ContentIsolated.instance) {
			throw new Error('ContentIsolated already initialized');
		}

		ContentIsolated.instance = new ContentIsolated();
		return ContentIsolated.instance;
	}

	private handleDevtoolsPanelConnection(): void {
		console.log('connection from devtools panel established');
		if (this.currentFibers.size === 0) return;
		this.chromeBridge.send({
			type: ChromeBridgeMessageType.FULL_SKELETON,
			content: Array.from(this.currentFibers.values()),
		});
	}

	private setupListeners(): void {
		// messages from content-main
		this.postMessageBridge.onMessage((message) => {
			switch (message.type) {
				case PostMessageType.REACT_ATTACHED:
					this.handleReactAttachedPostMessage(message);
					break;

				case PostMessageType.MOUNT_NODES:
					this.handleMountNodesPostMessage(message);
					break;

				case PostMessageType.UNMOUNT_NODES:
					this.handleUnmountNodesPostMessage(message);
					break;

				case PostMessageType.INSPECTED_DATA:
					this.handleInspectedDataPostMessage(message);
					break;

				default:
					console.error('unknown postMessageBridge message type', message);
					break;
			}
		});

		// messages from devtools panel via runtime connection
		this.chromeBridge.onMessage((message) => {
			switch (message.type) {
				case ChromeBridgeMessageType.INSPECT_ELEMENT:
					this.handleInspectElementBridgeMessage(message);
					break;

				default:
					console.error('unknown chromeBridge message type', message);
					break;
			}
		});

		// chrome API messages
		onChromeMessage((message) => {
			switch (message.type) {
				case ChromeMessageType.IS_REACT_ATTACHED:
					this.handleIsReactAttachedChromeMessage(message);
					break;

				default:
					console.error('unknown chrome message type', message);
					break;
			}
		});
	}

	// POST MESSAGE BRIDGE MESSAGES
	private handleReactAttachedPostMessage(_message: ReactAttachedPostMessage) {
		this.reactAttached = true;

		// Send message to devtools panel that react is attached,
		// devtools panel potentially opened before
		sendChromeMessage({
			type: ChromeMessageType.CREATE_DEVTOOLS_PANEL,
			source: ChromeMessageSource.CONTENT_SCRIPT,
		});
	}

	private handleMountNodesPostMessage(message: MountNodesPostMessage) {
		console.log('MOUNT_NODES', message.content);
		let areUpdates = false;

		message.content.forEach((mountNode) => {
			const pathFromRoot = mountNode.pathFromRoot;

			if (pathFromRoot.length === 0) {
				// no pathFromRoot means it's a root node
				this.currentFibers.set(mountNode.node.id, mountNode.node);
				areUpdates = true;
				return;
			}

			const [rootId, ...restOfPath] = pathFromRoot;
			const root = this.currentFibers.get(rootId);
			if (!root) {
				console.error('root not found');
				return;
			}

			// traverse the tree to find the parent node
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
				// Insert at the beginning of the children array
				current.children.unshift(mountNode.node);
				areUpdates = true;
				return;
			}

			const afterNodeIndex = current.children.findIndex(
				(child) => child.id === mountNode.afterNode
			);
			if (afterNodeIndex === -1) {
				console.error('afterNode not found');
				return;
			}

			// Insert after the afterNode
			current.children.splice(afterNodeIndex + 1, 0, mountNode.node);
			areUpdates = true;
		});

		if (!areUpdates) return;

		// TODO: maybe consider only sending info for updated roots?
		this.sendMessageThroughChromeBridgeIfConnected({
			type: ChromeBridgeMessageType.FULL_SKELETON,
			content: Array.from(this.currentFibers.values()),
		});
	}

	private handleUnmountNodesPostMessage(message: UnmountNodesPostMessage) {
		console.log('UNMOUNT_NODES', message.content);

		const [rootId, ...restOfPath] = message.content;
		if (restOfPath.length === 0) {
			this.currentFibers.delete(rootId);
		} else {
			const root = this.currentFibers.get(rootId);
			if (!root) {
				console.error('root not found');
				return;
			}

			const nodeToUnmount = restOfPath.pop();
			if (!nodeToUnmount) {
				console.error('node to unmount not found');
				return;
			}

			// traverse the tree to find the parent node
			let current = root;
			restOfPath.forEach((nodeOnPathId: NodeId) => {
				const child = current.children.find(
					(child) => child.id === nodeOnPathId
				);
				if (!child) {
					console.error('node on path not found');
					return;
				}

				current = child;
			});

			const childIndex = current.children.findIndex(
				(child) => child.id === nodeToUnmount
			);
			if (childIndex === -1) {
				console.error('node not found');
				return;
			}

			// remove the node from the parent's children array
			current.children.splice(childIndex, 1);
		}

		this.sendMessageThroughChromeBridgeIfConnected({
			type: ChromeBridgeMessageType.FULL_SKELETON,
			content: Array.from(this.currentFibers.values()),
		});
	}

	private handleInspectedDataPostMessage(message: InspectedDataPostMessage) {
		console.log('INSPECTED_DATA', message.content);
		this.sendMessageThroughChromeBridgeIfConnected({
			type: ChromeBridgeMessageType.INSPECTED_DATA,
			content: message.content,
		});
	}

	// CHROME BRIDGE MESSAGES
	private handleInspectElementBridgeMessage(
		message: InspectElementBridgeMessage
	): void {
		this.postMessageBridge.send({
			type: PostMessageType.INSPECT_ELEMENT,
			content: message.content,
		});
	}

	// CHROME MESSAGES
	private handleIsReactAttachedChromeMessage(
		message: IsReactAttachedChromeMessage
	): void {
		console.log('question from devtools panel: is react attached?');
		message.responseCallback(this.reactAttached);
	}

	private sendMessageThroughChromeBridgeIfConnected(
		message: ChromeBridgeMessage
	): void {
		if (this.chromeBridge.isConnected) {
			this.chromeBridge.send(message);
		}
	}
}
