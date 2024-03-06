import { NodeId } from '@src/shared/types/ParsedFiber';
import { SvelteNodeDetail } from '@pages/content/content-main/svelte/svelte-types';

let nodeIdCounter = 0;

const NODE_TO_ID_MAP = new Map<SvelteNodeDetail, NodeId>();

export function getOrGenerateNodeId(node: SvelteNodeDetail): NodeId {
	const nodeId = NODE_TO_ID_MAP.get(node);

	if (nodeId !== undefined) {
		return nodeId;
	}

	const id = nodeIdCounter++;
	NODE_TO_ID_MAP.set(node, id);

	return id;
}

