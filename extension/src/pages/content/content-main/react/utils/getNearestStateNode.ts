import { Fiber } from '@pages/content/content-main/react/react-types';

export function getNearestStateNode(fiber: Fiber): Node | null {
	let current: Fiber | null = fiber;
	let stateNode: Node | null = fiber.stateNode;

	while (current !== null && stateNode === null) {
		current = current.child;
		stateNode = current?.stateNode;
	}

	return stateNode;
}
