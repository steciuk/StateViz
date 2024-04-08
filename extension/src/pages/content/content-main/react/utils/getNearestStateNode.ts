import { Fiber } from '@pages/content/content-main/react/react-types';

export function getNearestStateNode(fiber: Fiber): Node | null {
	let current: Fiber | null = fiber;
	let stateNode = fiber.stateNode;

	while (current !== null && !(stateNode instanceof Node)) {
		current = current.child;
		stateNode = current?.stateNode;
	}

	if (!(stateNode instanceof Node)) {
		return null;
	}

	return stateNode;
}

