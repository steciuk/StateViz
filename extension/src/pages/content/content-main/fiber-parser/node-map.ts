import { Fiber } from '@pages/content/content-main/react-types';

let nodeIdCounter = 0;

export const NODE_TO_ID_MAP = new Map<Fiber, number>();

export function getOrGenerateNodeId(fiber: Fiber): number {
	const alternate = fiber.alternate;
	const fiberId = NODE_TO_ID_MAP.get(fiber);

	if (fiberId) {
		if (alternate && !NODE_TO_ID_MAP.get(alternate)) {
			NODE_TO_ID_MAP.set(alternate, fiberId);
		}

		return fiberId;
	}

	if (alternate) {
		const alternateId = NODE_TO_ID_MAP.get(alternate);

		if (alternateId) {
			NODE_TO_ID_MAP.set(fiber, alternateId);
			return alternateId;
		}
	}

	const id = nodeIdCounter++;
	NODE_TO_ID_MAP.set(fiber, id);

	if (alternate) {
		NODE_TO_ID_MAP.set(alternate, id);
	}

	return id;
}
