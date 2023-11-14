import { getOrGenerateFiberId } from '@pages/content/content-main/fiber-parser/fiber-map';
import { Fiber, FiberRoot } from '@pages/content/content-main/react-types';
import { ParsedFiber } from '@src/shared/types/ParsedFiber';
import { WorkTag } from '@src/shared/types/react-types';

export function parseRoot(root: FiberRoot): ParsedFiber {
	const fiber = root.current;
	const parsedFiber: ParsedFiber = {
		tag: fiber.tag,
		name: getFiberName(fiber),
		children: parseFiberChildren(fiber),
		id: getOrGenerateFiberId(fiber),
	};

	return parsedFiber;
}

const workTagsToSkip: WorkTag[] = [WorkTag.HostComponent, WorkTag.HostText];

function parseFiberChildren(fiber: Fiber): ParsedFiber[] {
	let currentChild: Fiber | null = fiber.child;

	const children: ParsedFiber[] = [];
	while (currentChild) {
		if (workTagsToSkip.includes(currentChild.tag)) {
			children.push(...parseFiberChildren(currentChild));
		} else {
			children.push({
				tag: currentChild.tag,
				name: getFiberName(currentChild),
				children: parseFiberChildren(currentChild),
				id: getOrGenerateFiberId(currentChild),
			});
		}

		currentChild = currentChild.sibling;
	}

	return children;
}

function getFiberName(fiber: Fiber): string {
	const type = fiber.type;

	switch (typeof type) {
		case 'string':
			return type;

		case 'function':
			return type.name;

		case 'symbol':
			return type.toString();

		default:
			return 'Unknown';
	}
}
