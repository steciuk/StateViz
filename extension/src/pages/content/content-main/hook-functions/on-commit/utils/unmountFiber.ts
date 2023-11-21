import { getOrGenerateNodeId } from '@pages/content/content-main/fiber-parser/node-map';
import { EXISTING_NODES_DATA } from '@pages/content/content-main/hook-functions/on-commit/utils/existing-nodes-storage';
import { sendUnmountOperations } from '@pages/content/content-main/hook-functions/on-commit/utils/send-operations';
import { Fiber } from '@pages/content/content-main/react-types';
import { NodeId } from '@src/shared/types/ParsedFiber';

export function unmountFiber(fiber: Fiber): void {
	const id = getOrGenerateNodeId(fiber);

	let shouldSendUnmount = true;
	const nodeData = EXISTING_NODES_DATA.get(id);
	if (!nodeData) return; // node was already unmounted

	let parentId: NodeId | null | undefined = nodeData.parentId;
	while (parentId !== null) {
		// Go up until the root
		if (parentId === undefined) {
			// parent was already unmounted
			shouldSendUnmount = false;
			break;
		}
		parentId = EXISTING_NODES_DATA.get(parentId)?.parentId;
	}

	if (shouldSendUnmount) {
		sendUnmountOperations(nodeData.pathFromRoot);
	}

	EXISTING_NODES_DATA.delete(id);
}
