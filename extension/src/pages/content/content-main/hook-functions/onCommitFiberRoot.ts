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
	UnmountNodesOperation,
} from '@pages/content/shared/PostMessageBridge';
import { NodeId, ParsedFiber } from '@src/shared/types/ParsedFiber';

const postMessageBridge = PostMessageBridge.getInstance(PostMessageSource.MAIN);

let unmountNodesOperations: UnmountNodesOperation = [];
let mountNodesOperations: MountNodesOperations = [];
const existingNodesPathsFormRoot: Map<NodeId, NodeId[]> = new Map();
const existingNodesParents = new Map<NodeId, NodeId | null>();

// TODO: cleanup the way those operations are sent
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
	unmount(fiber);
}

export function onCommitFiberRoot(
	rendererID: RendererID,
	root: FiberRoot,
	priorityLevel?: number,
	didError?: boolean
): void {
	const current = root.current;
	const alternate = current.alternate;

	// doesn't have alternate. New root mount for sure.
	if (!alternate) {
		return mountNewRoot(current);
	}

	// has alternate. Either a new root mount, unmount or an update.
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
		console.log('mount new root');
		return mountNewRoot(current);
	}
	if (wasMounted && isMounted) {
		// ? Update an existing root.
		console.log('update existing root');
		updateNodesRecursive(current, alternate, []);
		sendOperations();
		return;
	}
	if (wasMounted && !isMounted) {
		// ? Unmount an existing root.
		console.log('unmount existing root');
		return unmount(current);
	}
}

function updateNodesRecursive(
	nextFiber: Fiber,
	prevFiber: Fiber,
	pathFromRoot: NodeId[]
): void {
	// TODO: handle node reordering
	let higherSibling: Fiber | null = null;
	let child = nextFiber.child;
	if (child !== prevFiber.child) {
		const parentId = getOrGenerateNodeId(nextFiber);
		while (child) {
			const prevChild = child.alternate;
			if (prevChild) {
				// there was a child before
				updateNodesRecursive(child, prevChild, [...pathFromRoot, parentId]);
			} else {
				// there was no child before, we need to mount new child under this node
				const childId = getOrGenerateNodeId(child);
				existingNodesPathsFormRoot.set(childId, [...pathFromRoot, parentId]);
				existingNodesParents.set(childId, parentId);
				mountNodesOperations.push({
					pathFromRoot: [...pathFromRoot, parentId],
					afterNode: higherSibling ? getOrGenerateNodeId(higherSibling) : null,
					node: {
						tag: child.tag,
						name: getFiberName(child),
						children: parseChildren(child, [...pathFromRoot, parentId]),
						id: getOrGenerateNodeId(child),
					},
				});
			}
			higherSibling = child;
			child = child.sibling;
		}
	}
}

function mountNewRoot(root: Fiber): void {
	const rootId = getOrGenerateNodeId(root);
	existingNodesPathsFormRoot.set(rootId, []);
	existingNodesParents.set(rootId, null);
	const node: ParsedFiber = {
		tag: root.tag,
		name: getFiberName(root),
		children: parseChildren(root, [rootId]),
		id: rootId,
	};

	// currentFibers.set(node.id, node);

	mountNodesOperations = [
		{
			pathFromRoot: [],
			afterNode: null,
			node: node,
		},
	];

	sendOperations();
}

function unmount(fiber: Fiber): void {
	const id = getOrGenerateNodeId(fiber);

	let shouldSendUnmount = true;
	let parentId = existingNodesParents.get(id);
	while (parentId !== null) {
		// Go up until the root
		if (parentId === undefined) {
			// parent was already unmounted
			shouldSendUnmount = false;
			break;
		}
		parentId = existingNodesParents.get(parentId);
	}

	if (shouldSendUnmount) {
		const pathFromRoot = existingNodesPathsFormRoot.get(id);
		if (!pathFromRoot) {
			throw new Error('pathFromRoot not found');
		}
		unmountNodesOperations = [...pathFromRoot, id];
		sendOperations();
	}

	existingNodesPathsFormRoot.delete(id);
	existingNodesParents.delete(id);
}

function parseChildren(parent: Fiber, pathFromRoot: NodeId[]): ParsedFiber[] {
	let currentChild: Fiber | null = parent.child;
	const children: ParsedFiber[] = [];
	while (currentChild) {
		const childId = getOrGenerateNodeId(currentChild);
		existingNodesPathsFormRoot.set(childId, pathFromRoot);
		existingNodesParents.set(childId, getOrGenerateNodeId(parent));
		children.push({
			tag: currentChild.tag,
			name: getFiberName(currentChild),
			children: parseChildren(currentChild, [...pathFromRoot, childId]),
			id: childId,
		});

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
