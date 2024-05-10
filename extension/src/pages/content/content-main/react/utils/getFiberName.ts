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

export function extractNameFromType(type: Fiber['type']): string {
	if (type === null || type === undefined) return 'Unknown';
	if (typeof type === 'string') return type;
	if (typeof type === 'function') return type.name;
	if (typeof type === 'symbol') return type.toString();

	if (isForwardRef(type)) return getForwardRefName(type);

	return 'Unknown';
}

export function isForwardRef(obj: unknown): obj is ForwardRef {
	if (typeof obj !== 'object') return false;
	if (obj === null || obj === undefined) return false;
	if (!('$$typeof' in obj)) return false;
	if (typeof obj['$$typeof'] !== 'symbol') return false;
	if (obj['$$typeof'] !== Symbol.for('react.forward_ref')) return false;
	return true;
}

type ForwardRef = {
	displayName: unknown;
	// eslint-disable-next-line @typescript-eslint/ban-types
	render: Function;
};

function getForwardRefName(ref: ForwardRef): string {
	let name = 'Unknown';

	if (typeof ref.displayName === 'string' && ref.displayName.trim() !== '')
		name = ref.displayName;
	else if (typeof ref.render === 'function' && ref.render.name.trim() !== '')
		name = ref.render.name;

	return `ForwardRef(${name})`;
}

export const exportedForTest = {
	getForwardRefName,
};
