import { EXISTING_NODES_DATA } from '@pages/content/content-main/hook-functions/on-commit/utils/existing-nodes-storage';
import { getFiberName } from '@pages/content/content-main/hook-functions/on-commit/utils/getFiberName';
import { getOrGenerateNodeId } from '@pages/content/content-main/hook-functions/on-commit/utils/getOrGenerateNodeId';
import { Fiber } from '@pages/content/content-main/react-types';
import { NodeId, ParsedFiber } from '@src/shared/types/ParsedFiber';

export function getParseChildren(
	parent: Fiber,
	pathFromRoot: NodeId[]
): ParsedFiber[] {
	let currentChild: Fiber | null = parent.child;
	const children: ParsedFiber[] = [];
	while (currentChild) {
		const childId = getOrGenerateNodeId(currentChild);
		EXISTING_NODES_DATA.set(childId, {
			pathFromRoot: pathFromRoot,
			parentId: getOrGenerateNodeId(parent),
		});
		children.push({
			tag: currentChild.tag,
			name: getFiberName(currentChild),
			children: getParseChildren(currentChild, [...pathFromRoot, childId]),
			id: childId,
		});

		currentChild = currentChild.sibling;
	}

	return children;
}
