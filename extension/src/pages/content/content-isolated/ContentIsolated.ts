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
	WhatLibrariesAttachedChromeMessage,
	onChromeMessage,
	sendChromeMessage,
} from '@src/shared/chrome/chrome-message';
import {
	ChromeBridgeConnection,
	ChromeBridgeListener,
	ChromeBridgeMessage,
	ChromeBridgeMessageType,
	HoverElementBridgeMessage,
	InspectElementBridgeMessage,
} from '@src/shared/chrome/ChromeBridge';
import { Library } from '@src/shared/types/Library';
import {
	NodeId,
	ParsedNode,
	NodeAndLibrary,
} from '@src/shared/types/ParsedNode';
import { consoleError, consoleLog } from '@src/shared/utils/console';

export class ContentIsolated {
	private static instance: ContentIsolated | undefined;
	private readonly postMessageBridge: PostMessageBridge;
	private readonly chromeBridge: ChromeBridgeListener;
	private readonly librariesAttached: Set<Library> = new Set();

	private nodes: Map<NodeId, ParsedNode> = new Map();
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
		consoleLog('connection from devtools panel established');
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
			}
		});

		// chrome API messages
		onChromeMessage((message) => {
			switch (message.type) {
				case ChromeMessageType.WHAT_LIBRARIES_ATTACHED:
					this.handleIsLibraryAttachedChromeMessage(message);
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
			this.nodes.set(node.id, node);
			this.addNodesRecursively(node.children);
		});
	}

	private handleMountRootsPostMessage(message: MountRootsPostMessage) {
		consoleLog('MOUNT_ROOTS', message.content);

		this.addNodesRecursively(
			message.content.map((mountOperation) => mountOperation.node)
		);

		message.content.forEach((mountOperation) => {
			// TODO: check if roots are not repeated
			const inRootIndex = this.roots.findIndex(
				(root) => root.node.id === mountOperation.node.id
			);
			if (inRootIndex !== -1) {
				consoleError('Trying to mount root that is already mounted');
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
		consoleLog('MOUNT_NODES', message.content);

		let areUpdates = false;

		message.content.forEach((mountOperation) => {
			const { parentId, anchor, node } = mountOperation;

			const parent = this.nodes.get(parentId);
			if (!parent) {
				consoleError('Parent not found', parentId);
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
				if (anchor.type === 'after') parent.children.unshift(node as any);
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
		consoleLog('UPDATE_NODES', message.content);

		message.content.forEach((node) => {
			const existingNode = this.nodes.get(node.id);

			if (!existingNode) {
				consoleError('Node not found');
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
		const node = this.nodes.get(nodeId);

		if (!node) {
			consoleError('Could not find the node to remove');
			return;
		}

		this.nodes.delete(node.id);
		node.children.forEach((node) => this.removeNodesRecursively(node.id));
	}

	private handleUnmountNodesPostMessage(message: UnmountNodesPostMessage) {
		consoleLog('UNMOUNT_NODES', message.content);

		const { parentId, id: nodeToUnmountId } = message.content;

		this.removeNodesRecursively(nodeToUnmountId);

		if (parentId === null) {
			this.roots = this.roots.filter(
				(root) => root.node.id !== nodeToUnmountId
			);
		} else {
			const parent = this.nodes.get(parentId);

			if (!parent) {
				consoleError('Parent not found');
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
		consoleLog('INSPECTED_DATA', message.content);
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
		message: WhatLibrariesAttachedChromeMessage
	): void {
		consoleLog('Is library attached?');
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

