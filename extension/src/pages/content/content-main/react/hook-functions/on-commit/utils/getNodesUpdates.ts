import { EXISTING_FIBERS_DATA } from '@pages/content/content-main/react/hook-functions/on-commit/utils/existing-nodes-storage';
import { getFiberName } from '@pages/content/content-main/react/hook-functions/on-commit/utils/getFiberName';
import { getOrGenerateFiberId } from '@pages/content/content-main/react/hook-functions/on-commit/utils/getOrGenerateFiberId';
import { getParseChildren } from '@pages/content/content-main/react/hook-functions/on-commit/utils/parseChildren';
import { handleNodeInspect } from '@pages/content/content-main/react/inspect-element/inspect-element';
import { Fiber } from '@pages/content/content-main/react/react-types';
import { MountNodesOperations } from '@pages/content/shared/PostMessageBridge';

export function getNodesUpdates(
	nextFiber: Fiber,
	prevFiber: Fiber
): MountNodesOperations {
	// TODO: handle node reordering
	const operations: MountNodesOperations = [];
	let higherSibling: Fiber | null = null;
	let child = nextFiber.child;
	if (child !== prevFiber.child) {
		const parentId = getOrGenerateFiberId(nextFiber);
		while (child) {
			const childId = getOrGenerateFiberId(child);

			handleNodeInspect(child);
			EXISTING_FIBERS_DATA.set(childId, {
				parentId: parentId,
				fiber: child,
			});

			const prevChild = child.alternate;
			if (prevChild) {
				// there was a child before
				operations.push(...getNodesUpdates(child, prevChild));
			} else {
				// there was no child before, we need to mount new child under this node
				operations.push({
					parentId,
					afterNode: higherSibling ? getOrGenerateFiberId(higherSibling) : null,
					node: {
						tag: child.tag,
						name: getFiberName(child),
						children: getParseChildren(child),
						id: getOrGenerateFiberId(child),
					},
				});
			}
			higherSibling = child;
			child = child.sibling;
		}
	}

	return operations;
}

