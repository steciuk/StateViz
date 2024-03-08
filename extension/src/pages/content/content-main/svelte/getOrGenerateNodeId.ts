import { NodeId } from '@src/shared/types/ParsedFiber';
import { SvelteComponentFragment } from '@pages/content/content-main/svelte/svelte-types';

let nodeIdCounter = 0;

const NODE_TO_ID_MAP = new Map<SvelteComponentFragment | Node, NodeId>();

export function getOrGenerateNodeId(
	node: SvelteComponentFragment | Node
): NodeId {
	const nodeId = NODE_TO_ID_MAP.get(node);

	if (nodeId !== undefined) {
		return nodeId;
	}

	console.log('new element', node);
	const id = nodeIdCounter++;
	NODE_TO_ID_MAP.set(node, id);

	return id;
}

// export function getNextNodeId(): NodeId {
//   return nodeIdCounter++;
// }

