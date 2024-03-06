import { EXISTING_FIBERS_DATA } from '@pages/content/content-main/react/hook-functions/on-commit/utils/existing-nodes-storage';
import { getOrGenerateFiberId } from '@pages/content/content-main/react/hook-functions/on-commit/utils/getOrGenerateFiberId';
import { sendUnmountOperations } from '@pages/content/content-main/react/hook-functions/on-commit/utils/send-operations';
import { INSPECTED_DATA_MAP } from '@pages/content/content-main/react/inspect-element/inspect-element';
import { Fiber } from '@pages/content/content-main/react/react-types';
import { NodeId } from '@src/shared/types/ParsedFiber';

export function unmountFiber(fiber: Fiber): void {
	const id = getOrGenerateFiberId(fiber);

	let shouldSendUnmount = true;
	const nodeData = EXISTING_FIBERS_DATA.get(id);
	if (!nodeData) return; // node was already unmounted

	let parentId: NodeId | null | undefined = nodeData.parentId;
	while (parentId !== null) {
		// Go up until the root
		if (parentId === undefined) {
			// parent was already unmounted
			shouldSendUnmount = false;
			break;
		}
		parentId = EXISTING_FIBERS_DATA.get(parentId)?.parentId;
	}

	if (shouldSendUnmount) {
		sendUnmountOperations(nodeData.pathFromRoot);
	}

	EXISTING_FIBERS_DATA.delete(id);
	INSPECTED_DATA_MAP.delete(id);
}

