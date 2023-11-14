import { Fiber } from '@pages/content/content-main/react-types';

let fiberIdCounter = 0;

export const FIBER_TO_ID_MAP = new Map<Fiber, number>();

export function getOrGenerateFiberId(fiber: Fiber): number {
	const alternate = fiber.alternate;
	const fiberId = FIBER_TO_ID_MAP.get(fiber);

	if (fiberId) {
		if (alternate && !FIBER_TO_ID_MAP.get(alternate)) {
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

	console.log('NEW ID');
	const id = fiberIdCounter++;
	FIBER_TO_ID_MAP.set(fiber, id);

	if (alternate) {
		FIBER_TO_ID_MAP.set(alternate, id);
	}

	return id;
}
