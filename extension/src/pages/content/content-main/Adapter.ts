import { NodeId, ParsedNode } from '@src/shared/types/ParsedNode';
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
import { getClosestElement } from '@pages/content/content-main/utils/getClosestElement';
import { Library } from '@src/shared/types/Library';
import { NodeInspectedData } from '@src/shared/types/NodeInspectedData';

export abstract class Adapter<
	T extends { node: Node | null },
	L extends Library,
> {
	private static idCounter = 0;
	private static readonly elementToId = new Map<unknown, NodeId>();
	private static readonly registeredLibraries = new Set<Library>();
	private static readonly registeredPrefixes = new Map<string, number>();
	private static overlay?: HTMLDivElement;
	private static removeOverlayOnResizeUpdate?: () => void;

	protected readonly adapterPrefix: string;

	protected abstract inject(): void;
	protected abstract handlePostMessageBridgeMessage(message: PostMessage): void;

	protected readonly existingNodes: Map<NodeId, T> = new Map();

	protected constructor(
		private readonly postMessageBridge: PostMessageBridge,
		protected readonly library: L
	) {
		if (Adapter.registeredLibraries.has(library)) {
			throw new Error('Adapter for this library already registered');
		}

		Adapter.registeredLibraries.add(library);
		const adapterPrefix = library.slice(0, 2).toLowerCase();

		const existingPrefixCount =
			Adapter.registeredPrefixes.get(adapterPrefix) ?? 0;
		Adapter.registeredPrefixes.set(adapterPrefix, existingPrefixCount + 1);

		this.adapterPrefix = `${existingPrefixCount}${adapterPrefix}`;

		this.postMessageBridge.onMessage((message) => {
			this.handlePostMessageBridgeMessage(message);

			if (message.type === PostMessageType.HOVER_ELEMENT) {
				this.handleHoverPostMessage(message);
			}
		});

		this.inject();
	}

	protected sendLibraryAttached(): void {
		this.postMessageBridge.send({
			type: PostMessageType.LIBRARY_ATTACHED,
			content: this.library,
		});
	}

	protected sendMountRoots(roots: ParsedNode<L>[]): void {
		const operations: MountRootsOperations<L> = roots.map((root) => ({
			node: root,
			library: this.library,
		}));

		this.postMessageBridge.send({
			type: PostMessageType.MOUNT_ROOTS,
			content: operations,
		});
	}

	protected sendMountNodes(operations: MountNodesOperations<L>): void {
		this.postMessageBridge.send({
			type: PostMessageType.MOUNT_NODES,
			content: operations,
		});
	}

	protected sendUpdateNodes(operations: UpdateNodesOperations<L>): void {
		this.postMessageBridge.send({
			type: PostMessageType.UPDATE_NODES,
			content: operations,
		});
	}

	protected sendUnmountNodes(operations: UnmountNodesOperation): void {
		this.postMessageBridge.send({
			type: PostMessageType.UNMOUNT_NODES,
			content: operations,
		});
	}

	protected sendInspectedData(content: NodeInspectedData[]): void {
		this.postMessageBridge.send({
			type: PostMessageType.INSPECTED_DATA,
			content,
		});
	}

	protected getOrGenerateElementId(element: unknown): NodeId {
		const existingId = Adapter.elementToId.get(element);
		if (existingId) {
			return existingId;
		}

		const id = `${this.adapterPrefix}${Adapter.idCounter++}`;
		Adapter.elementToId.set(element, id);
		return id;
	}

	private handleHoverPostMessage(chromeMessage: HoverElementPostMessage): void {
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

		window.addEventListener('resize', onResizeOverlay);
		Adapter.removeOverlayOnResizeUpdate = () => {
			window.removeEventListener('resize', onResizeOverlay);
			Adapter.removeOverlayOnResizeUpdate = undefined;
		};
	}

	private setOverlay(element: Element): void {
		const containerRect = element.getBoundingClientRect();
		const style = window.getComputedStyle(element);
		const position = style.position === 'fixed' ? 'fixed' : 'absolute';
		const offsetY = style.position === 'fixed' ? 0 : window.scrollY;
		const offsetX = style.position === 'fixed' ? 0 : window.scrollX;

		const overlay = document.createElement('div');
		overlay.style.position = position;
		overlay.style.top = `${containerRect.top + offsetY}px`;
		overlay.style.left = `${containerRect.left + offsetX}px`;
		overlay.style.width = `${containerRect.width}px`;
		overlay.style.height = `${containerRect.height}px`;
		overlay.style.backgroundColor = 'rgba(0, 0, 255, 0.2)';
		overlay.style.zIndex = '9999999999';
		overlay.style.pointerEvents = 'none';

		document.body.appendChild(overlay);
		Adapter.overlay = overlay;
	}
}

