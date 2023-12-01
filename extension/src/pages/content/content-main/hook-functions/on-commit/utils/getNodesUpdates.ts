import { EXISTING_NODES_DATA } from '@pages/content/content-main/hook-functions/on-commit/utils/existing-nodes-storage';
import { getFiberName } from '@pages/content/content-main/hook-functions/on-commit/utils/getFiberName';
import { getOrGenerateNodeId } from '@pages/content/content-main/hook-functions/on-commit/utils/getOrGenerateNodeId';
import { getParseChildren } from '@pages/content/content-main/hook-functions/on-commit/utils/parseChildren';
import { handleNodeInspect } from '@pages/content/content-main/inspect-element/inspect-element';
import { Fiber } from '@pages/content/content-main/react-types';
import { MountNodesOperations } from '@pages/content/shared/PostMessageBridge';
import { NodeId } from '@src/shared/types/ParsedFiber';

export function getNodesUpdates(
	nextFiber: Fiber,
	prevFiber: Fiber,
	pathFromRoot: NodeId[],
): MountNodesOperations {
	// TODO: handle node reordering
	const operations: MountNodesOperations = [];
	let higherSibling: Fiber | null = null;
	let child = nextFiber.child;
	if (child !== prevFiber.child) {
		const parentId = getOrGenerateNodeId(nextFiber);
		while (child) {
			handleNodeInspect(child);
			const childId = getOrGenerateNodeId(child);
			const prevChild = child.alternate;
			if (prevChild) {
				// there was a child before
				operations.push(
					...getNodesUpdates(child, prevChild, [...pathFromRoot, childId]),
				);
			} else {
				// there was no child before, we need to mount new child under this node
				EXISTING_NODES_DATA.set(childId, {
					pathFromRoot: [...pathFromRoot, childId],
					parentId: parentId,
				});
				operations.push({
					pathFromRoot: pathFromRoot,
					afterNode: higherSibling ? getOrGenerateNodeId(higherSibling) : null,
					node: {
						tag: child.tag,
						name: getFiberName(child),
						children: getParseChildren(child, [...pathFromRoot, childId]),
						id: getOrGenerateNodeId(child),
					},
				});
			}
			higherSibling = child;
			child = child.sibling;
		}
	}

	return operations;
}
