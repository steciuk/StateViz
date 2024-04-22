import { NodeId, NodeAndLibrary } from '@src/shared/types/ParsedNode';
import {
	HoverElementPostMessage,
	MountNodesOperations,
	MountRootsOperations,
	PostMessage,
	PostMessageBridge,
	PostMessageType,
	UnmountNodesOperation,
	UpdateNodesOperations,
} from '@pages/content/shared/PostMessageBridge';
import { InspectedDataMessageContent } from '@src/shared/chrome-messages/ChromeBridge';
import { getClosestElement } from '@pages/content/content-main/utils/getClosestElement';

export abstract class Adapter<T extends { node: Node | null }> {
	private static ID_COUNTER = 0;
	private static readonly ELEMENT_TO_ID = new Map<unknown, NodeId>();
	private static readonly REGISTERED_ADAPTERS = new Set<string>();
	private static overlay?: HTMLElement;
	private static removeOverlayOnResizeUpdate?: () => void;

	private isInitialized = false;

	constructor(protected readonly postMessageBridge: PostMessageBridge) {}

	protected abstract readonly adapterPrefix: string;
	protected abstract inject(): void;
	protected abstract handlePostMessageBridgeMessage(message: PostMessage): void;

	protected existingNodes: Map<NodeId, T> = new Map();

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

			if (message.type === PostMessageType.HOVER_ELEMENT) {
				this.handleHoverPostMessage(message);
			}
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

	private handleHoverPostMessage(chromeMessage: HoverElementPostMessage) {
		const parsedNode = this.existingNodes.get(chromeMessage.content);
		if (!parsedNode) {
			return;
		}

		Adapter.overlay?.remove();
		Adapter.removeOverlayOnResizeUpdate?.();

		const node = parsedNode.node;
		if (!node) {
			return;
		}

		const element = getClosestElement(node);
		if (!element) {
			return;
		}

		this.setOverlay(element);
		const onResizeOverlay = () => {
			Adapter.overlay?.remove();
			this.setOverlay(element);
		};

		console.log('added');
		window.addEventListener('resize', onResizeOverlay);
		Adapter.removeOverlayOnResizeUpdate = () => {
			console.log('removed');
			window.removeEventListener('resize', onResizeOverlay);
			Adapter.removeOverlayOnResizeUpdate = undefined;
		};
	}

	private setOverlay(element: Element): void {
		const containerRect = element.getBoundingClientRect();
		const style = window.getComputedStyle(element);
		const position = style.position === 'fixed' ? 'fixed' : 'absolute';
		const offsetY = style.position !== 'fixed' ? window.scrollY : 0;
		const offsetX = style.position !== 'fixed' ? window.scrollX : 0;

		const overlay = document.createElement('div');
		overlay.style.position = position;
		overlay.style.top = `${containerRect.top + offsetY}px`;
		overlay.style.left = `${containerRect.left + offsetX}px`;
		overlay.style.width = `${containerRect.width}px`;
		overlay.style.height = `${containerRect.height}px`;
		overlay.style.backgroundColor = 'rgba(0, 0, 255, 0.2)';
		overlay.style.zIndex = '9999999999';

		document.body.appendChild(overlay);
		Adapter.overlay = overlay;
	}
}

