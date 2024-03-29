import { NodeId, NodeAndLibrary } from '@src/shared/types/ParsedNode';
import {
	MountNodesOperations,
	MountRootsOperations,
	PostMessage,
	PostMessageBridge,
	PostMessageType,
	UnmountNodesOperation,
	UpdateNodesOperations,
} from '@pages/content/shared/PostMessageBridge';
import { InspectedDataMessageContent } from '@src/shared/chrome-messages/ChromeBridge';

export abstract class Adapter {
	private static ID_COUNTER = 0;
	private static readonly ELEMENT_TO_ID = new Map<unknown, NodeId>();
	private static readonly REGISTERED_ADAPTERS = new Set<string>();

	private isInitialized = false;

	constructor(protected readonly postMessageBridge: PostMessageBridge) {}

	protected abstract readonly adapterPrefix: string;
	protected abstract inject(): void;
	protected abstract handlePostMessageBridgeMessage(message: PostMessage): void;

	initialize() {
		if (this.isInitialized) {
			throw new Error('Adapter already initialized');
		}

		if (Adapter.REGISTERED_ADAPTERS.has(this.adapterPrefix)) {
			throw new Error('Adapter with this prefix already registered');
		}

		Adapter.REGISTERED_ADAPTERS.add(this.adapterPrefix);

		this.postMessageBridge.onMessage((message) => {
			this.handlePostMessageBridgeMessage(message);
		});

		this.isInitialized = true;
		this.inject();
	}

	protected sendLibraryAttached() {
		this.postMessageBridge.send({
			type: PostMessageType.LIBRARY_ATTACHED,
		});
	}

	protected sendMountRoots(roots: MountRootsOperations) {
		this.postMessageBridge.send({
			type: PostMessageType.MOUNT_ROOTS,
			content: roots,
		});
	}

	protected sendMountNodes(operations: MountNodesOperations) {
		this.postMessageBridge.send({
			type: PostMessageType.MOUNT_NODES,
			content: operations,
		});
	}

	protected sendUpdateNodes(operations: UpdateNodesOperations) {
		this.postMessageBridge.send({
			type: PostMessageType.UPDATE_NODES,
			content: operations,
		});
	}

	protected sendUnmountNodes(operations: UnmountNodesOperation) {
		this.postMessageBridge.send({
			type: PostMessageType.UNMOUNT_NODES,
			content: operations,
		});
	}

	protected sendInspectedData(content: InspectedDataMessageContent) {
		this.postMessageBridge.send({
			type: PostMessageType.INSPECTED_DATA,
			content,
		});
	}

	protected getOrGenerateElementId(element: unknown): NodeId {
		const existingId = Adapter.ELEMENT_TO_ID.get(element);
		if (existingId) {
			return existingId;
		}

		const id = `${this.adapterPrefix}${Adapter.ID_COUNTER++}`;
		Adapter.ELEMENT_TO_ID.set(element, id);
		return id;
	}
}

