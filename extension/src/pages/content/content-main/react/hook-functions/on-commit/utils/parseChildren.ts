import { EXISTING_FIBERS_DATA } from '@pages/content/content-main/react/hook-functions/on-commit/utils/existing-nodes-storage';
import { getFiberName } from '@pages/content/content-main/react/hook-functions/on-commit/utils/getFiberName';
import { getOrGenerateFiberId } from '@pages/content/content-main/react/hook-functions/on-commit/utils/getOrGenerateFiberId';
import { handleNodeInspect } from '@pages/content/content-main/react/inspect-element/inspect-element';
import { Fiber } from '@pages/content/content-main/react/react-types';
import { ParsedFiber } from '@src/shared/types/ParsedFiber';

export function getParseChildren(parent: Fiber): ParsedFiber[] {
	let currentChild: Fiber | null = parent.child;
	const children: ParsedFiber[] = [];
	while (currentChild) {
		const childId = getOrGenerateFiberId(currentChild);
		EXISTING_FIBERS_DATA.set(childId, {
			parentId: getOrGenerateFiberId(parent),
			fiber: currentChild,
		});

		handleNodeInspect(currentChild);

		children.push({
			tag: currentChild.tag,
			name: getFiberName(currentChild),
			children: getParseChildren(currentChild),
			id: childId,
		});

		currentChild = currentChild.sibling;
	}

	return children;
}

