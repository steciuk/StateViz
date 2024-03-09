import { NodeId } from '@src/shared/types/ParsedNode';
import { SvelteComponentFragment } from '../svelte/svelte-types';

import { Fiber } from '../react/react-types';

let idCounter = 0;

const NODE_TO_ID_MAP = new Map<SvelteComponentFragment | Node, NodeId>();
const FIBER_TO_ID_MAP = new Map<Fiber, NodeId>();

export function getOrGenerateNodeId(
	node: SvelteComponentFragment | Node
): NodeId {
	const nodeId = NODE_TO_ID_MAP.get(node);

	if (nodeId !== undefined) {
		return nodeId;
	}

	const id = idCounter++;
	console.log('new element', id, node);
	NODE_TO_ID_MAP.set(node, id);

	return id;
}

export function getOrGenerateFiberId(fiber: Fiber): NodeId {
	const alternate = fiber.alternate;
	const fiberId = FIBER_TO_ID_MAP.get(fiber);

	if (fiberId !== undefined) {
		if (alternate && !FIBER_TO_ID_MAP.has(alternate)) {
			FIBER_TO_ID_MAP.set(alternate, fiberId);
		}

		return fiberId;
	}

	if (alternate) {
		const alternateId = FIBER_TO_ID_MAP.get(alternate);

		if (alternateId) {
			FIBER_TO_ID_MAP.set(fiber, alternateId);
			return alternateId;
		}
	}

	const id = idCounter++;
	FIBER_TO_ID_MAP.set(fiber, id);

	if (alternate) {
		FIBER_TO_ID_MAP.set(alternate, id);
	}

	return id;
}

