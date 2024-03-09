import {
	InspectedDataPostMessage,
	MountNodesPostMessage,
	PostMessageBridge,
	PostMessageSource,
	PostMessageType,
	LibraryAttachedPostMessage,
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
	private libraryAttached: boolean = false;

	private currentFibers: Map<NodeId, ParsedFiber> = new Map();
	private roots: ParsedFiber[] = [];

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
			content: this.roots,
		});
	}

	private setupListeners(): void {
		// messages from content-main
		this.postMessageBridge.onMessage((message) => {
			switch (message.type) {
				case PostMessageType.LIBRARY_ATTACHED:
					this.handleLibraryAttachedPostMessage(message);
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
	private handleLibraryAttachedPostMessage(
		_message: LibraryAttachedPostMessage
	) {
		this.libraryAttached = true;

		// Send message to devtools panel that library is attached,
		// devtools panel potentially opened before
		sendChromeMessage({
			type: ChromeMessageType.CREATE_DEVTOOLS_PANEL,
			source: ChromeMessageSource.CONTENT_SCRIPT,
		});
	}

	private addNodesRecursively(nodes: ParsedFiber[]) {
		nodes.forEach((node) => {
			this.currentFibers.set(node.id, node);
			this.addNodesRecursively(node.children);
		});
	}

	private handleMountNodesPostMessage(message: MountNodesPostMessage) {
		console.log('MOUNT_NODES', message.content);

		this.addNodesRecursively(
			message.content.map((mountOperation) => mountOperation.node)
		);
		let areUpdates = false;

		message.content.forEach((mountOperation) => {
			const { parentId, afterNode, node } = mountOperation;

			if (parentId === null) {
				this.roots.push(node);
				areUpdates = true;
				return;
			}

			const parent = this.currentFibers.get(parentId);
			if (!parent) {
				console.error('parent not found');
				return;
			}

			if (afterNode === null) {
				parent.children.unshift(node);
				areUpdates = true;
				return;
			}

			const afterNodeIndex = parent.children.findIndex(
				(child) => child.id === afterNode
			);
			if (afterNodeIndex === -1) {
				console.error('afterNode not found');
				return;
			}

			// Insert after the afterNode
			parent.children.splice(afterNodeIndex + 1, 0, node);
			areUpdates = true;
		});

		if (!areUpdates) return;

		// TODO: maybe consider only sending info for updated roots?
		this.sendMessageThroughChromeBridgeIfConnected({
			type: ChromeBridgeMessageType.FULL_SKELETON,
			content: this.roots,
		});
	}

	private handleUnmountNodesPostMessage(message: UnmountNodesPostMessage) {
		console.log('UNMOUNT_NODES', message.content);

		const { parentId, id: nodeToUnmountId } = message.content;

		if (parentId === null) {
			this.roots = this.roots.filter((node) => node.id !== nodeToUnmountId);
		} else {
			const parent = this.currentFibers.get(parentId);

			if (!parent) {
				console.error('parent not found');
				return;
			}

			parent.children = parent.children.filter(
				(node) => node.id !== nodeToUnmountId
			);
		}

		console.warn(this.roots);

		this.sendMessageThroughChromeBridgeIfConnected({
			type: ChromeBridgeMessageType.FULL_SKELETON,
			content: this.roots,
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
		message.responseCallback(this.libraryAttached);
	}

	private sendMessageThroughChromeBridgeIfConnected(
		message: ChromeBridgeMessage
	): void {
		if (this.chromeBridge.isConnected) {
			this.chromeBridge.send(message);
		}
	}
}

