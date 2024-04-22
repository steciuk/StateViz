import { Fiber } from '@pages/content/content-main/react/react-types';
import { WorkTag } from '@src/shared/types/react-types';

export function getFiberName(fiber: Fiber): string {
	const typeName = extractNameFromType(fiber.type);
	const tag = fiber.tag;

	switch (tag) {
		case WorkTag.HostComponent:
			return `<${typeName}>`;
		case WorkTag.HostRoot:
			return 'HostRoot';
		case WorkTag.HostText:
			if (
				typeof fiber.memoizedProps === 'string' &&
				fiber.memoizedProps.trim() !== ''
			)
				return `"${fiber.memoizedProps}"`;
			return 'HostText';
		case WorkTag.Fragment:
			return '<>';
		case WorkTag.ContextProvider:
			return 'Context.Provider';
		case WorkTag.ContextConsumer:
			return 'Context.Consumer';
		default:
			return typeName;
	}
}

function extractNameFromType(type: Fiber['type']): string {
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

