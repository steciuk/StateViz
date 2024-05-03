import { Adapter } from '@pages/content/content-main/Adapter';
import { NodeId, ParsedReactNode } from '@src/shared/types/ParsedNode';
import {
	Fiber,
	FiberRoot,
	ReactDevToolsHook,
	ReactRenderer,
	RendererID,
} from '@pages/content/content-main/react/react-types';
import { Library } from '@src/shared/types/Library';
import {
	MountNodesOperations,
	PostMessage,
	PostMessageBridge,
	PostMessageType,
} from '@pages/content/shared/PostMessageBridge';
import { NodeInspectedData } from '@src/shared/types/NodeInspectedData';
import { WorkTag } from '@src/shared/types/react-types';
import { ListenersStorage } from '@pages/content/content-main/react/utils/ListenersStorage';
import { getNodeData } from '@pages/content/content-main/react/inspect-element/inspect-element';
import { getFiberName } from '@pages/content/content-main/react/utils/getFiberName';
import { getNearestStateNode } from '@pages/content/content-main/react/utils/getNearestStateNode';

declare global {
	interface Window {
		__REACT_DEVTOOLS_GLOBAL_HOOK__?: ReactDevToolsHook;
	}
}

export class ReactAdapter extends Adapter<
	{
		parentId: NodeId | null;
		fiber: Fiber;
		node: Node | null;
	},
	Library.REACT
> {
	private readonly renderers = new Map<RendererID, ReactRenderer>();
	private readonly listeners = new ListenersStorage();

	private readonly fiberToId = new Map<Fiber, NodeId>();
	private idCounter = 0;

	private inspectedElementsIds: NodeId[] = [];
	private readonly inspectedData = new Map<NodeId, NodeInspectedData>();

	// TODO: consider allowing more renderers
	private readonly rendererId = 0;

	constructor(postMessageBridge: PostMessageBridge) {
		super(postMessageBridge, Library.REACT);
	}

	protected override inject(): void {
		const reactHook = window.__REACT_DEVTOOLS_GLOBAL_HOOK__;

		// Check if RTD or StateViz already hooked
		if (reactHook) {
			if (reactHook.stateViz) {
				console.error('StateViz for React already hooked');
				return;
			} else {
				// TODO: consider integrating with RDT
				console.error(
					'React DevTools already hooked. Disable it to use StateViz for React'
				);
				return;
			}
		}

		// Hook StateViz for React
		window.__REACT_DEVTOOLS_GLOBAL_HOOK__ = {
			stateViz: true,
			// rendererInterfaces: RENDERER_INTERFACES,
			// listeners: LISTENERS.expose(),
			// backends: new Map(),
			// without this react breaks
			renderers: this.renderers,
			supportsFiber: true,

			inject: (renderer) => this.handleInject(renderer),
			// emit: emit,
			// getFiberRoots: (rendererId: number) => {
			// 	// Not yet used
			// 	let fiber_roots = FIBER_ROOTS.get(rendererId);
			// 	if (!fiber_roots) {
			// 		fiber_roots = new Set();
			// 		FIBER_ROOTS.set(rendererId, fiber_roots);
			// 	}

			// 	return fiber_roots;
			// },
			// on: on,
			// off: off,
			// sub: sub,
			// used to dismiss the "Download the React DevTools" banner shown by React
			checkDCE: () => {
				return;
			},
			onCommitFiberUnmount: (rendererID: number, fiber: Fiber) =>
				this.unmountFiber(fiber),
			onCommitFiberRoot: (...args) => this.handleCommitFiberRoot(...args),
			// onPostCommitFiberRoot: (rendererID: number, root: any) => {
			// 	// console.log('onPostCommitFiberRoot', rendererID, root);
			// },
			// setStrictMode: (rendererID: number, isStrict: any) => {
			// 	// console.log('setStrictMode', rendererID, isStrict);
			// },
			// probably only for profiler
			// getInternalModuleRanges: () => {
			//	// console.log('getInternalModuleRanges');
			// 	return [];
			// },
			// registerInternalModuleStart: (moduleStartError: Error) => {
			// 	// console.log('registerInternalModuleStart', moduleStartError);
			// },
			// registerInternalModuleStop: (moduleStopError: Error) => {
			// 	// console.log('registerInternalModuleStop', moduleStopError);
			// },
		};
	}
	protected override handlePostMessageBridgeMessage(
		message: PostMessage
	): void {
		// Request to inspect nodes
		if (message.type === PostMessageType.INSPECT_ELEMENT) {
			// filter out not existing or other library elements
			const ownInspectedElementsIds = message.content.filter((id) =>
				this.existingNodes.has(id)
			);

			this.inspectedElementsIds = ownInspectedElementsIds;
			// if empty array it means that front stopped inspecting
			if (ownInspectedElementsIds.length === 0) return;

			console.log('INSPECT_ELEMENT', ownInspectedElementsIds);

			const fibersToInspect = ownInspectedElementsIds
				.map((id) => this.existingNodes.get(id)?.fiber)
				.filter((fiber): fiber is Fiber => fiber !== undefined);

			fibersToInspect.forEach((fiber) => this.refreshInspectedData(fiber));
			this.flushInspectedData();
		}
	}

	private refreshInspectedData(fiber: Fiber) {
		const id = this.getOrGenerateElementId(fiber);

		if (this.inspectedElementsIds.includes(id)) {
			console.log(fiber);
			const nodeData = getNodeData(fiber);

			this.inspectedData.set(id, {
				library: this.library,
				id,
				name: getFiberName(fiber),
				nodeInfo: [{ label: 'Type', value: WorkTag[fiber.tag] ?? 'Unknown' }],
				nodeData,
			});
		}
	}

	private flushInspectedData() {
		const data: NodeInspectedData[] = this.inspectedElementsIds
			.map((id) => this.inspectedData.get(id))
			.filter(
				<T>(data: T): data is Extract<T, NodeInspectedData> =>
					data !== undefined
			);

		if (data.length === 0) return;

		this.sendInspectedData(data);
	}

	private handleInject(renderer: ReactRenderer): number | null {
		console.log('inject', renderer);
		if (this.renderers.size > 0) {
			// TODO: consider allowing more renderers
			console.warn('Only one renderer is supported');
			return null;
		}

		this.sendLibraryAttached();

		this.renderers.set(this.rendererId, renderer);
		// this.rendererId++

		// TODO: Possible console patching here

		// Why is this needed? (see: extension/src/pages/content/index.ts)
		// window.postMessage(
		// 	{
		// 		source: 'react-devtools-detector',
		// 		reactBuildType: 'development',
		// 	},
		// 	'*'
		// );
		// emit('renderer', {
		//   id: rendererId,
		//   renderer,
		//   reactBuildType: 'development'
		// });

		return this.rendererId;
	}

	private handleCommitFiberRoot(
		rendererID: RendererID,
		root: FiberRoot,
		_priorityLevel?: number,
		_didError?: boolean
	): void {
		console.log(root);
		const current = root.current;
		const alternate = current.alternate;

		// doesn't have alternate. New root mount for sure.
		if (!alternate) {
			return this.mountNewRoot(current);
		}

		// has alternate. Either a new root mount, unmount or an update.
		const wasMounted =
			alternate.memoizedState !== null &&
			alternate.memoizedState.element !== null &&
			alternate.memoizedState.isDehydrated !== true;
		const isMounted =
			current.memoizedState != null &&
			current.memoizedState.element !== null &&
			current.memoizedState.isDehydrated !== true;

		if (!wasMounted && isMounted) {
			// ? Mount a new root.
			console.log('mount new root');
			this.mountNewRoot(current);
		} else if (wasMounted && isMounted) {
			// ? Update an existing root.
			console.log('update existing root');
			this.updateRoot(current, alternate);
		} else if (wasMounted && !isMounted) {
			// ? Unmount an existing root.
			console.log('unmount existing root');
			this.unmountFiber(current);
		}

		this.flushInspectedData();
	}

	private mountNewRoot(root: Fiber): void {
		const rootId = this.getOrGenerateElementId(root);

		this.refreshInspectedData(root);
		this.existingNodes.set(rootId, {
			parentId: null,
			fiber: root,
			node: getNearestStateNode(root),
		});

		const node: ParsedReactNode = {
			type: root.tag,
			name: getFiberName(root),
			children: this.getParseChildren(root),
			id: rootId,
		};

		this.sendMountRoots([node]);
	}

	private getParseChildren(parent: Fiber): ParsedReactNode[] {
		let currentChild: Fiber | null = parent.child;
		const children: ParsedReactNode[] = [];
		while (currentChild) {
			const childId = this.getOrGenerateElementId(currentChild);
			this.existingNodes.set(childId, {
				parentId: this.getOrGenerateElementId(parent),
				fiber: currentChild,
				node: getNearestStateNode(currentChild),
			});

			this.refreshInspectedData(currentChild);

			children.push({
				type: currentChild.tag,
				name: getFiberName(currentChild),
				children: this.getParseChildren(currentChild),
				id: childId,
			});

			currentChild = currentChild.sibling;
		}

		return children;
	}

	private updateRoot(current: Fiber, alternate: Fiber): void {
		const operations = this.getNodesUpdates(current, alternate);
		if (operations.length === 0) return;
		this.sendMountNodes(operations);
	}

	private unmountFiber(fiber: Fiber): void {
		const id = this.getOrGenerateElementId(fiber);

		let shouldSendUnmount = true;
		const nodeData = this.existingNodes.get(id);
		if (!nodeData) return; // node was already unmounted

		let parentId: NodeId | null | undefined = nodeData.parentId;
		while (parentId !== null) {
			// Go up until the root
			if (parentId === undefined) {
				// parent was already unmounted
				shouldSendUnmount = false;
				break;
			}
			parentId = this.existingNodes.get(parentId)?.parentId;
		}

		if (shouldSendUnmount) {
			this.sendUnmountNodes({
				parentId: nodeData.parentId,
				id,
			});
		}

		this.existingNodes.delete(id);
		this.inspectedData.delete(id);
	}

	private getNodesUpdates(
		nextFiber: Fiber,
		prevFiber: Fiber
	): MountNodesOperations<Library.REACT> {
		// TODO: handle node reordering
		const operations: MountNodesOperations<Library.REACT> = [];
		let higherSibling: Fiber | null = null;
		let child = nextFiber.child;
		if (child !== prevFiber.child) {
			const parentId = this.getOrGenerateElementId(nextFiber);
			while (child) {
				const childId = this.getOrGenerateElementId(child);

				this.refreshInspectedData(child);
				this.existingNodes.set(childId, {
					parentId: parentId,
					fiber: child,
					node: getNearestStateNode(child),
				});

				const prevChild = child.alternate;
				if (prevChild) {
					// there was a child before
					operations.push(...this.getNodesUpdates(child, prevChild));
				} else {
					// there was no child before, we need to mount new child under this node
					operations.push({
						parentId,
						anchor: {
							type: 'after',
							id: higherSibling
								? this.getOrGenerateElementId(higherSibling)
								: null,
						},
						node: {
							type: child.tag,
							name: getFiberName(child),
							children: this.getParseChildren(child),
							id: this.getOrGenerateElementId(child),
						},
					});
				}
				higherSibling = child;
				child = child.sibling;
			}
		}

		return operations;
	}

	protected override getOrGenerateElementId(fiber: Fiber): NodeId {
		const alternate = fiber.alternate;
		const fiberId = this.fiberToId.get(fiber);

		if (fiberId !== undefined) {
			if (alternate && !this.fiberToId.has(alternate)) {
				this.fiberToId.set(alternate, fiberId);
			}

			return fiberId;
		}

		if (alternate) {
			const alternateId = this.fiberToId.get(alternate);

			if (alternateId) {
				this.fiberToId.set(fiber, alternateId);
				return alternateId;
			}
		}

		const id = `${this.adapterPrefix}${this.idCounter++}`;
		this.fiberToId.set(fiber, id);

		if (alternate) {
			this.fiberToId.set(alternate, id);
		}

		return id;
	}
}

