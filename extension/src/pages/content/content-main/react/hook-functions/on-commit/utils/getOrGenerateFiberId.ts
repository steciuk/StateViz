import { Fiber } from '@pages/content/content-main/react/react-types';
import { NodeId } from '@src/shared/types/ParsedFiber';

let fiberIdCounter = 0;

const FIBER_TO_ID_MAP = new Map<Fiber, NodeId>();

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

	const id = fiberIdCounter++;
	FIBER_TO_ID_MAP.set(fiber, id);

	if (alternate) {
		FIBER_TO_ID_MAP.set(alternate, id);
	}

	return id;
}

