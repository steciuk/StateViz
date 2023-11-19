import path from 'path';

import { getOrGenerateNodeId } from '@pages/content/content-main/fiber-parser/node-map';
import {
	Fiber,
	FiberRoot,
	RendererID,
} from '@pages/content/content-main/react-types';
import {
	MountNodesOperations,
	PostMessageBridge,
	PostMessageSource,
	PostMessageType,
	UnmountNodesOperations,
} from '@pages/content/shared/PostMessageBridge';
import { NodeId, ParsedFiber } from '@src/shared/types/ParsedFiber';
import { WorkTag } from '@src/shared/types/react-types';

const postMessageBridge = PostMessageBridge.getInstance(PostMessageSource.MAIN);

// const currentFibers: Map<NodeId, ParsedFiber> = new Map();

// TODO: Remove ===============================================================
// const knownFibers: Map<Fiber, number> = new Map();
// let currentId = 0;
// function getId(fiber: Fiber): number {
// 	const id = knownFibers.get(fiber);
// 	if (id) {
// 		return id;
// 	}

// 	const newId = currentId++;
// 	knownFibers.set(fiber, newId);
// 	return newId;
// }

// function getChildren(fiber: Fiber): any[] {
// 	const children = [];
// 	let child = fiber.child;
// 	while (child) {
// 		if (isNodeSkipped(child)) {
// 			children.push(...getChildren(child));
// 			child = child.sibling;
// 			continue;
// 		}

// 		const childAlternate = child.alternate;
// 		children.push({
// 			current: {
// 				id: getId(child),
// 				name: getFiberName(child),
// 				children: getChildren(child),
// 			},
// 			alternate: childAlternate
// 				? {
// 						id: getId(childAlternate),
// 						name: getFiberName(childAlternate),
// 						children: getChildren(childAlternate),
// 				  }
// 				: null,
// 		});
// 		child = child.sibling;
// 	}
// 	return children;
// }

// function logFiberTreeWithAlternates(root: Fiber): void {
// 	const alternate = root.alternate;
// 	const result = {
// 		current: {
// 			id: getId(root),
// 			name: getFiberName(root),
// 			children: getChildren(root),
// 		},
// 		alternate: alternate
// 			? {
// 					id: getId(alternate),
// 					name: getFiberName(alternate),
// 					children: getChildren(alternate),
// 			  }
// 			: null,
// 	};

// 	console.log(result);
// }
// ============================================================================

let unmountNodesOperations: UnmountNodesOperations = [];
let mountNodesOperations: MountNodesOperations = [];

function sendOperations(): void {
	if (unmountNodesOperations.length > 0) {
		postMessageBridge.send({
			type: PostMessageType.UNMOUNT_NODES,
			content: unmountNodesOperations,
		});
		unmountNodesOperations = [];
	}

	if (mountNodesOperations.length > 0) {
		postMessageBridge.send({
			type: PostMessageType.MOUNT_NODES,
			content: mountNodesOperations,
		});
		mountNodesOperations = [];
	}
}

export function onCommitFiberUnmount(
	rendererID: RendererID,
	fiber: Fiber
): void {
	console.log('unmount', fiber);
	const id = getOrGenerateNodeId(fiber);
	// currentFibers.delete(id);

	unmountNodesOperations.push(id);
	sendOperations();
}

export function onCommitFiberRoot(
	rendererID: RendererID,
	root: FiberRoot,
	priorityLevel?: number,
	didError?: boolean
): void {
	// logFiberTreeWithAlternates(root.current);
	const current = root.current;
	const alternate = current.alternate;

	// doesn't have alternate. New root mount for sure.
	if (!alternate) {
		return mountNewRoot(current);
	}

	// has alternate. Either a new root mount, unmount or an update.
	// this mechanizm was copied from RDT, TODO: understand it better
	const wasMounted =
		alternate.memoizedState !== null &&
		alternate.memoizedState.element !== null &&
		alternate.memoizedState.isDehydrated !== true;
	const isMounted =
		current.memoizedState != null &&
		current.memoizedState.element != null &&
		current.memoizedState.isDehydrated !== true;

	if (!wasMounted && isMounted) {
		// ? Mount a new root.
		return mountNewRoot(current);
	}
	if (wasMounted && isMounted) {
		// ? Update an existing root.
		updateNodesRecursive(current, alternate, []);
		sendOperations();
		return;
	}
	if (wasMounted && !isMounted) {
		// ? Unmount an existing root.
		return unmountRoot(current);
	}
	// console.log(root);
	// const parsedFiber = parseRoot(root);
	// console.log(parsedFiber);
	// postMessageBridge.send({
	// 	type: PostMessageType.COMMIT_ROOT,
	// 	content: parsedFiber,
	// });
}

function updateNodesRecursive(
	nextFiber: Fiber,
	prevFiber: Fiber,
	pathFromRoot: NodeId[]
): void {
	const skip = isNodeSkipped(nextFiber);
	// let shouldResetChildren = false;

	let higherSibling: Fiber | null = null;
	let child = nextFiber.child;
	if (child !== prevFiber.child) {
		// ? If the first child is different, we need to traverse them.
		// ? Each next child will be either a new child (mount) or an alternate (update).

		while (child) {
			// ? We already know children will be referentially different because
			// ? they are either new mounts or alternates of previous children.
			// ? Schedule updates and mounts depending on whether alternates exist.
			// ? We don't track deletions here because they are reported separately.
			const prevChild = child.alternate;
			if (prevChild) {
				// there was a child before
				// if (
				updateNodesRecursive(
					child,
					prevChild,
					skip
						? pathFromRoot
						: [...pathFromRoot, getOrGenerateNodeId(nextFiber)]
				);
				// ) {
				// 	// ? If a nested tree child order changed but it can't handle its own
				// 	// ? child order invalidation (e.g. because it's filtered out like host nodes),
				// 	// ? propagate the need to reset child order upwards to this Fiber.
				// 	shouldResetChildren = true;
				// }
				// // ? However we also keep track if the order of the children matches
				// // ? the previous order. They are always different referentially, but
				// // ? if the instances line up conceptually we'll want to know that.
				// if (prevChild !== childAlternate) {
				// 	shouldResetChildren = true;
				// }
			} else {
				// there was no child before, we need to mount new child under this node
				mountNodesOperations.push({
					pathFromRoot: skip // if parent is filtered out, we don't need to add it to path
						? pathFromRoot
						: [...pathFromRoot, getOrGenerateNodeId(nextFiber)],
					afterNode: higherSibling ? getOrGenerateNodeId(higherSibling) : null,
					node: {
						tag: child.tag,
						name: getFiberName(child),
						children: parseChildren(child),
						id: getOrGenerateNodeId(child),
					},
				});

				// shouldResetChildren = true;
			}

			// ? Try the next child.
			higherSibling = child; // FIXME: this doesn't work for filtered nodes
			child = child.sibling;
			// ? Advance the pointer in the previous list so that we can
			// ? keep comparing if they line up.
			// if (!shouldResetChildren && childAlternate !== null) {
			// 	childAlternate = childAlternate.sibling;
			// }
		}

		// ? If we have no more children, but used to, they don't line up.
		// if (childAlternate !== null) {
		// 	shouldResetChildren = true;
		// }
	}

	// if (shouldResetChildren) {
	// 	// We need to crawl the subtree for closest non-filtered Fibers
	// 	// so that we can display them in a flat children set.
	// 	if (!skip) {
	// 		// Normally, search for children from the rendered child.
	// 		// let nextChildSet = nextFiber.child;
	// 		// if (nextChildSet != null) {
	// 		// 	recordResetChildren(nextFiber, nextChildSet);
	// 		// }
	// 		// We've handled the child order change for this Fiber.
	// 		// Since it's included, there's no need to invalidate parent child order.
	// 		return false;
	// 	} else {
	// 		// Let the closest unfiltered parent Fiber reset its child order instead.
	// 		return true;
	// 	}
	// } else {
	// 	return false;
	// }
}

function mountNewRoot(root: Fiber): void {
	const node: ParsedFiber = {
		tag: root.tag,
		name: getFiberName(root),
		children: parseChildren(root),
		id: getOrGenerateNodeId(root),
	};

	// currentFibers.set(node.id, node);

	mountNodesOperations.push({
		pathFromRoot: [],
		afterNode: null,
		node: node,
	});

	sendOperations();
}

function unmountRoot(root: Fiber): void {
	const id = getOrGenerateNodeId(root);
	// currentFibers.delete(id);

	unmountNodesOperations.push(id);

	sendOperations();
}

const nodeTagsToSkip: Set<WorkTag> = new Set([
	WorkTag.HostPortal,
	WorkTag.HostText,
	WorkTag.SuspenseComponent, // TODO: add support for Suspense
	WorkTag.OffscreenComponent,
	WorkTag.LegacyHiddenComponent,
	WorkTag.OffscreenComponent,
	WorkTag.HostComponent, // TODO: maybe add posibility to show or hide
	WorkTag.Fragment, // TODO: in RDT they check if key of fragment is null, why?
	WorkTag.Mode, // TODO: in RDT they are more granular about mode
]);

function isNodeSkipped(fiber: Fiber): boolean {
	return nodeTagsToSkip.has(fiber.tag);
}

function parseChildren(parent: Fiber): ParsedFiber[] {
	let currentChild: Fiber | null = parent.child;

	const children: ParsedFiber[] = [];
	while (currentChild) {
		if (isNodeSkipped(currentChild)) {
			children.push(...parseChildren(currentChild));
		} else {
			children.push({
				tag: currentChild.tag,
				name: getFiberName(currentChild),
				children: parseChildren(currentChild),
				id: getOrGenerateNodeId(currentChild),
			});
		}

		currentChild = currentChild.sibling;
	}

	return children;
}

function getFiberName(fiber: Fiber): string {
	const type = fiber.type;

	switch (typeof type) {
		case 'string':
			return type;

		case 'function':
			return type.name;

		case 'symbol':
			return type.toString();

		default:
			return 'Unknown';
	}
}
