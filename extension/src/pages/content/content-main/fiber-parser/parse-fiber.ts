import {
	Fiber,
	FiberRoot,
	WorkTag,
} from '@pages/content/content-main/react-types';

export function parseRoot(root: FiberRoot): ParsedFiber {
	const fiber = root.current;
	const parsedFiber: ParsedFiber = {
		tag: fiber.tag,
		name: getFiberName(fiber),
		children: parseFiberChildren(fiber),
	};

	return parsedFiber;
}

const workTagsToSkip: WorkTag[] = [WorkTag.HostComponent];

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
			});
		}

		currentChild = currentChild.sibling;
	}

	return children;
}

type ParsedFiber = {
	tag: WorkTag;
	name: string;
	children: ParsedFiber[];
};

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
