import { EXISTING_FIBERS_DATA } from '@pages/content/content-main/react/hook-functions/on-commit/utils/existing-nodes-storage';
import { getFiberName } from '@pages/content/content-main/react/hook-functions/on-commit/utils/getFiberName';
import { getOrGenerateFiberId } from '@pages/content/content-main/utils/getOrGenerateId';
import { getParseChildren } from '@pages/content/content-main/react/hook-functions/on-commit/utils/parseChildren';
import { sendMountRootsOperations } from '@pages/content/content-main/react/hook-functions/on-commit/utils/send-operations';
import { handleNodeInspect } from '@pages/content/content-main/react/inspect-element/inspect-element';
import { Fiber } from '@pages/content/content-main/react/react-types';
import { Library } from '@src/shared/types/Library';
import { ParsedReactNode } from '@src/shared/types/ParsedNode';

export function mountNewRoot(root: Fiber): void {
	const rootId = getOrGenerateFiberId(root);

	handleNodeInspect(root);
	EXISTING_FIBERS_DATA.set(rootId, {
		parentId: null,
		fiber: root,
	});

	const node: ParsedReactNode = {
		tag: root.tag,
		name: getFiberName(root),
		children: getParseChildren(root),
		id: rootId,
	};

	sendMountRootsOperations([
		{
			library: Library.REACT,
			root: node,
		},
	]);
}
