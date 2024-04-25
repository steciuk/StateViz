import {
	InspectedDataPostMessage,
	MountNodesPostMessage,
	PostMessageBridge,
	PostMessageSource,
	PostMessageType,
	LibraryAttachedPostMessage,
	UnmountNodesPostMessage,
	MountRootsPostMessage,
	UpdateNodesPostMessage,
} from '@pages/content/shared/PostMessageBridge';
import {
	ChromeMessageSource,
	ChromeMessageType,
	IsLibraryAttachedChromeMessage,
	onChromeMessage,
	sendChromeMessage,
} from '@src/shared/chrome-messages/chrome-message';
import {
	ChromeBridgeConnection,
	ChromeBridgeListener,
	ChromeBridgeMessage,
	ChromeBridgeMessageType,
	HoverElementBridgeMessage,
	InspectElementBridgeMessage,
} from '@src/shared/chrome-messages/ChromeBridge';
import { Library } from '@src/shared/types/Library';
import {
	NodeId,
	ParsedNode,
	NodeAndLibrary,
} from '@src/shared/types/ParsedNode';

export class ContentIsolated {
	private static instance: ContentIsolated | undefined;
	private readonly postMessageBridge: PostMessageBridge;
	private readonly chromeBridge: ChromeBridgeListener;
	private readonly librariesAttached: Set<Library> = new Set();

	private currentNodes: Map<NodeId, ParsedNode> = new Map();
	private roots: NodeAndLibrary[] = [];

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

				case PostMessageType.MOUNT_ROOTS:
					this.handleMountRootsPostMessage(message);
					break;

				case PostMessageType.MOUNT_NODES:
					this.handleMountNodesPostMessage(message);
					break;

				case PostMessageType.UPDATE_NODES:
					this.handleNodeUpdatePostMessage(message);
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

				case ChromeBridgeMessageType.HOVER_ELEMENT:
					this.handleHoverElementBridgeMessage(message);
					break;

				default:
					console.error('unknown chromeBridge message type', message);
					break;
			}
		});

		// chrome API messages
		onChromeMessage((message) => {
			switch (message.type) {
				case ChromeMessageType.IS_LIBRARY_ATTACHED:
					this.handleIsLibraryAttachedChromeMessage(message);
					break;

				default:
					console.error('unknown chrome message type', message);
					break;
			}
		});
	}

	// POST MESSAGE BRIDGE MESSAGES
	private handleLibraryAttachedPostMessage(
		message: LibraryAttachedPostMessage
	) {
		this.librariesAttached.add(message.content);

		// Send message to devtools / background panel that library is attached,
		// devtools panel potentially opened before
		sendChromeMessage({
			type: ChromeMessageType.LIBRARY_ATTACHED,
			source: ChromeMessageSource.CONTENT_SCRIPT,
			content: message.content,
		});
	}

	private addNodesRecursively(nodes: ParsedNode[]) {
		nodes.forEach((node) => {
			this.currentNodes.set(node.id, node);
			this.addNodesRecursively(node.children);
		});
	}

	private handleMountRootsPostMessage(message: MountRootsPostMessage) {
		console.log('MOUNT_ROOTS', message.content);

		this.addNodesRecursively(
			message.content.map((mountOperation) => mountOperation.node)
		);

		message.content.forEach((mountOperation) => {
			// TODO: check if roots are not repeated
			const inRootIndex = this.roots.findIndex(
				(root) => root.node.id === mountOperation.node.id
			);
			if (inRootIndex !== -1) {
				console.error('Trying to mount root that is already mounted');
				return;
			}

			this.roots.push(mountOperation);
		});

		this.sendMessageThroughChromeBridgeIfConnected({
			type: ChromeBridgeMessageType.FULL_SKELETON,
			content: this.roots,
		});
	}

	private handleMountNodesPostMessage(message: MountNodesPostMessage) {
		console.log('MOUNT_NODES', message.content);

		let areUpdates = false;

		message.content.forEach((mountOperation) => {
			const { parentId, anchor, node } = mountOperation;

			const parent = this.currentNodes.get(parentId);
			if (!parent) {
				console.error('parent not found', parentId);
				return;
			}

			this.addNodesRecursively([node]);

			const anchorNodeIndex =
				anchor.id === null
					? -1
					: parent.children.findIndex((child) => child.id === anchor.id);

			if (anchorNodeIndex === -1) {
				// TODO: think of some type fix
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				if (anchor.type === 'before') parent.children.unshift(node as any);
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				else parent.children.push(node as any);

				areUpdates = true;
				return;
			}

			// TODO: think of some type fix
			const spliceIndex =
				anchor.type === 'after' ? anchorNodeIndex + 1 : anchorNodeIndex;
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			parent.children.splice(spliceIndex, 0, node as any);
			areUpdates = true;
		});

		if (!areUpdates) return;

		// TODO: maybe consider only sending info for updated roots?
		this.sendMessageThroughChromeBridgeIfConnected({
			type: ChromeBridgeMessageType.FULL_SKELETON,
			content: this.roots,
		});
	}

	private handleNodeUpdatePostMessage(message: UpdateNodesPostMessage) {
		console.log('UPDATE_NODES', message.content);

		message.content.forEach((node) => {
			const existingNode = this.currentNodes.get(node.id);

			if (!existingNode) {
				console.error('node not found');
				return;
			}

			Object.assign(existingNode, node);
		});

		this.sendMessageThroughChromeBridgeIfConnected({
			type: ChromeBridgeMessageType.FULL_SKELETON,
			content: this.roots,
		});
	}

	private removeNodesRecursively(nodeId: NodeId) {
		const node = this.currentNodes.get(nodeId);

		if (!node) {
			console.error('Could not find the node to remove');
			return;
		}

		this.currentNodes.delete(node.id);
		node.children.forEach((node) => this.removeNodesRecursively(node.id));
	}

	private handleUnmountNodesPostMessage(message: UnmountNodesPostMessage) {
		console.log('UNMOUNT_NODES', message.content);

		const { parentId, id: nodeToUnmountId } = message.content;

		this.removeNodesRecursively(nodeToUnmountId);

		if (parentId === null) {
			this.roots = this.roots.filter(
				(root) => root.node.id !== nodeToUnmountId
			);
		} else {
			const parent = this.currentNodes.get(parentId);

			if (!parent) {
				console.error('parent not found');
				return;
			}

			parent.children = parent.children.filter(
				(node) => node.id !== nodeToUnmountId
			) as typeof parent.children;
		}

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

	private handleHoverElementBridgeMessage(
		message: HoverElementBridgeMessage
	): void {
		this.postMessageBridge.send({
			type: PostMessageType.HOVER_ELEMENT,
			content: message.content,
		});
	}

	// CHROME MESSAGES
	private handleIsLibraryAttachedChromeMessage(
		message: IsLibraryAttachedChromeMessage
	): void {
		console.log('question from devtools panel: is library attached?');
		message.responseCallback([...this.librariesAttached.values()]);
	}

	private sendMessageThroughChromeBridgeIfConnected(
		message: ChromeBridgeMessage
	): void {
		if (this.chromeBridge.isConnected) {
			this.chromeBridge.send(message);
		}
	}
}

