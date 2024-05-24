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
	PostMessageBridge,
} from '@pages/content/shared/PostMessageBridge';
import { NodeInspectedData } from '@src/shared/types/NodeInspectedData';
import { WorkTag } from '@src/shared/types/react-types';
import { getNodeData } from '@pages/content/content-main/react/inspect-element/inspect-element';
import { getFiberName } from '@pages/content/content-main/react/utils/getFiberName';
import { getNearestStateNode } from '@pages/content/content-main/react/utils/getNearestStateNode';
import { getRendererMajorVersion } from '@pages/content/content-main/react/utils/getRendererMajorVersion';
import { consoleError, consoleLog } from '@src/shared/utils/console';

declare global {
	interface Window {
		__REACT_DEVTOOLS_GLOBAL_HOOK__?: ReactDevToolsHook;
	}
}

const MIN_REACT_VERSION = 16;

export class ReactAdapter extends Adapter<
	{
		parentId: NodeId | null;
		fiber: Fiber;
		node: Node | null;
	},
	Library.REACT
> {
	private readonly renderers = new Map<RendererID, ReactRenderer>();

	private inspectedElementsIds = new Set<NodeId>();
	private readonly inspectedData = new Map<NodeId, NodeInspectedData>();

	private rendererIdCounter = 0;

	constructor(postMessageBridge: PostMessageBridge) {
		super(Library.REACT, postMessageBridge);
	}

	protected override inject(): void {
		const reactHook = window.__REACT_DEVTOOLS_GLOBAL_HOOK__;

		// Check if RTD or StateViz already hooked
		if (reactHook) {
			if (reactHook.stateViz) {
				throw new Error('StateViz for React already hooked');
			} else {
				// TODO: https://github.com/steciuk/StateViz/issues/53
				throw new Error(
					'React DevTools already hooked. Disable it to use StateViz for React'
				);
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
			checkDCE: () => {},
			onCommitFiberUnmount: (_, fiber) => this.unmountFiber(fiber),
			onCommitFiberRoot: (...args) => this.handleCommitFiberRoot(...args),
			// onPostCommitFiberRoot: (rendererID: number, root: any) => {
			// 	// consoleLog('onPostCommitFiberRoot', rendererID, root);
			// },
			// setStrictMode: (rendererID: number, isStrict: any) => {
			// 	// consoleLog('setStrictMode', rendererID, isStrict);
			// },
			// probably only for profiler
			// getInternalModuleRanges: () => {
			//	// consoleLog('getInternalModuleRanges');
			// 	return [];
			// },
			// registerInternalModuleStart: (moduleStartError: Error) => {
			// 	// consoleLog('registerInternalModuleStart', moduleStartError);
			// },
			// registerInternalModuleStop: (moduleStopError: Error) => {
			// 	// consoleLog('registerInternalModuleStop', moduleStopError);
			// },
		};

		// Check if RTD didn't override the hook
		setTimeout(() => {
			if (!window.__REACT_DEVTOOLS_GLOBAL_HOOK__?.stateViz) {
				throw new Error(
					'React DevTools override detected. Disable it to use StateViz for React'
				);
			}
		}, 5000);
	}

	protected override inspectElements(ids: NodeId[]): void {
		this.inspectedElementsIds = new Set(ids);
		// if empty array it means that front stopped inspecting
		if (ids.length === 0) return;
		consoleLog('INSPECT_ELEMENT', ids);

		for (const id of ids) {
			const nodeData = this.existingNodes.get(id);
			if (nodeData) {
				this.refreshInspectedData(nodeData.fiber);
			}
		}

		this.flushInspectedData();
	}

	private refreshInspectedData(fiber: Fiber) {
		const id = this.getElementId(fiber);

		if (this.inspectedElementsIds.has(id)) {
			consoleLog(fiber);
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
		const data: NodeInspectedData[] = [...this.inspectedElementsIds.values()]
			.map((id) => this.inspectedData.get(id))
			.filter(
				<T>(data: T): data is Extract<T, NodeInspectedData> =>
					data !== undefined
			);

		if (data.length === 0) return;

		this.sendInspectedData(data);
	}

	private handleInject(renderer: ReactRenderer): number | null {
		consoleLog('inject', renderer);

		const rendererVersion = getRendererMajorVersion(renderer.version);
		if (rendererVersion === null || rendererVersion < MIN_REACT_VERSION) {
			consoleError(`Unsupported React version: ${renderer.version}`);
			return null;
		}

		this.sendLibraryAttached();
		const id = this.rendererIdCounter++;
		this.renderers.set(id, renderer);

		// TODO: Possible console patching here

		return id;
	}

	private handleCommitFiberRoot(
		rendererID: RendererID,
		root: FiberRoot,
		_priorityLevel?: number,
		_didError?: boolean
	): void {
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
			this.mountNewRoot(current);
		} else if (wasMounted && isMounted) {
			// ? Update an existing root.
			this.updateRoot(current, alternate);
		} else if (wasMounted && !isMounted) {
			// ? Unmount an existing root.
			this.unmountFiber(current);
		}

		this.flushInspectedData();
	}

	private mountNewRoot(root: Fiber): void {
		const rootId = this.getElementId(root);

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
			const childId = this.getElementId(currentChild);
			this.existingNodes.set(childId, {
				parentId: this.getElementId(parent),
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
		const id = this.getElementId(fiber);

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
		// TODO: https://github.com/steciuk/StateViz/issues/7
		const operations: MountNodesOperations<Library.REACT> = [];
		let higherSibling: Fiber | null = null;
		let child = nextFiber.child;
		if (child !== prevFiber.child) {
			const parentId = this.getElementId(nextFiber);
			while (child) {
				const childId = this.getElementId(child);

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
							id: higherSibling ? this.getElementId(higherSibling) : null,
						},
						node: {
							type: child.tag,
							name: getFiberName(child),
							children: this.getParseChildren(child),
							id: this.getElementId(child),
						},
					});
				}
				higherSibling = child;
				child = child.sibling;
			}
		}

		return operations;
	}

	protected override getElementId(fiber: Fiber): NodeId {
		const alternate = fiber.alternate;
		const fiberId = this.elementToId.get(fiber);

		if (fiberId !== undefined) {
			if (alternate && !this.elementToId.has(alternate)) {
				this.elementToId.set(alternate, fiberId);
			}

			return fiberId;
		}

		if (alternate) {
			const alternateId = this.elementToId.get(alternate);

			if (alternateId) {
				this.elementToId.set(fiber, alternateId);
				return alternateId;
			}
		}

		const id = this.generateNewElementId();
		this.elementToId.set(fiber, id);

		if (alternate) {
			this.elementToId.set(alternate, id);
		}

		return id;
	}
}

