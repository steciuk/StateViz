import { NodeId, Root } from '@src/shared/types/ParsedNode';
import {
	MountNodesOperations,
	MountRootsOperations,
	PostMessageBridge,
	PostMessageType,
	UnmountNodesOperation,
	UpdateNodesOperations,
} from '@pages/content/shared/PostMessageBridge';

export abstract class Adapter {
	private static ID_COUNTER = 0;
	private static readonly ELEMENT_TO_ID = new Map<unknown, NodeId>();
	private static readonly REGISTERED_ADAPTERS = new Set<string>();

	private isInitialized = false;

	constructor(protected readonly postMessageBridge: PostMessageBridge) {}

	protected abstract adapterPrefix: string;
	protected abstract inject(): void;

	initialize() {
		if (this.isInitialized) {
			throw new Error('Adapter already initialized');
		}

		if (Adapter.REGISTERED_ADAPTERS.has(this.adapterPrefix)) {
			throw new Error('Adapter with this prefix already registered');
		}

		Adapter.REGISTERED_ADAPTERS.add(this.adapterPrefix);

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

