import { dehydrate } from '@pages/content/content-main/dehydrate';
import {
	Fiber,
	HookType,
	MemoizedState,
} from '@pages/content/content-main/react/react-types';
import { InspectData, NodeInspectedData } from '@src/shared/types/DataType';

export function getNodeData(fiber: Fiber): NodeInspectedData['nodeData'] {
	// TODO: maybe try to check if changed and don't send if not
	const hooks = parseHooks(fiber);
	const props = parseProps(fiber);

	return [
		{
			group: 'Props',
			data: props,
		},
		{
			group: 'Hooks',
			data: hooks,
		},
	];
}

function parseProps(fiber: Fiber) {
	const fiberProps = fiber.memoizedProps;

	if (!fiberProps) return [];

	return Object.entries(fiberProps).map(([key, value]) => ({
		label: key,
		value: dehydrate(value, 0),
	}));
}

function parseHooks(fiber: Fiber) {
	const state: InspectData[] = [];
	let current: MemoizedState | null = fiber.memoizedState;

	while (current) {
		state.push(dehydrate(current.memoizedState, 0));
		current = current.next;
	}

	const hooksNames =
		fiber._debugHookTypes && fiber._debugHookTypes.length === state.length
			? fiber._debugHookTypes
			: new Array<HookType | 'unknown'>(state.length).fill('unknown');

	return state.map((data, index) => ({
		label: hooksNames[index],
		value: data,
	}));
}

