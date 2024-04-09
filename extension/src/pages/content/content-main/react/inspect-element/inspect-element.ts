import { dehydrate } from '@pages/content/content-main/dehydrate';
import {
	Fiber,
	HookFullMemoizedState,
	HookLessMemoizedState,
	HookType,
} from '@pages/content/content-main/react/react-types';
import { InspectData, NodeDataGroup } from '@src/shared/types/DataType';
import { WorkTag } from '@src/shared/types/react-types';

export function getNodeData(fiber: Fiber): NodeDataGroup[] {
	// TODO: maybe try to check if changed and don't send if not
	const props = parseProps(fiber);
	const state = getNodeState(fiber);

	return [props, state].filter(
		<T>(data: T): data is Extract<T, NodeDataGroup> => data !== null
	);
}

function parseProps(fiber: Fiber): NodeDataGroup | null {
	switch (fiber.tag) {
		case WorkTag.Fragment:
		case WorkTag.HostRoot:
			return null;
	}

	const fiberProps = fiber.memoizedProps;

	if (!fiberProps) return null;
	const parsedProps =
		typeof fiberProps === 'object'
			? Object.entries(fiberProps).map(([key, value]) => ({
					label: key,
					value: dehydrate(value, 0),
			  }))
			: [{ label: 'value', value: dehydrate(fiberProps, 0) }];

	return {
		group: 'Props',
		data: parsedProps,
	};
}

function getNodeState(fiber: Fiber): NodeDataGroup | null {
	switch (fiber.tag) {
		case WorkTag.Fragment:
		case WorkTag.HostRoot:
			return null;
	}

	const state = fiber.memoizedState;

	if (!state) return null;

	if (
		Object.hasOwn(state, 'baseState') &&
		Object.hasOwn(state, 'memoizedState') &&
		Object.hasOwn(state, 'next')
	) {
		return parseHooks(state as HookFullMemoizedState, fiber._debugHookTypes);
	}

	return parseState(state as HookLessMemoizedState);
}

function parseHooks(
	memoizedState: HookFullMemoizedState,
	hookTypes?: HookType[] | null
): NodeDataGroup {
	const state: InspectData[] = [];
	let current: HookFullMemoizedState | null = memoizedState;

	while (current) {
		state.push(dehydrate(current.memoizedState, 0));
		current = current.next;
	}

	// useDebugValue doesn't have an associated memoized state
	hookTypes = hookTypes?.filter((hookType) => hookType !== 'useDebugValue');

	const hooksNames =
		hookTypes && hookTypes.length === state.length
			? hookTypes
			: new Array<HookType | 'unknown'>(state.length).fill('unknown');

	return {
		group: 'Hooks',
		data: state.map((data, index) => ({
			label: hooksNames[index],
			value: data,
		})),
	};
}

function parseState(memoizedState: HookLessMemoizedState): NodeDataGroup {
	return {
		group: 'State',
		data: Object.entries(memoizedState).map(([key, value]) => ({
			label: key,
			value: dehydrate(value, 0),
		})),
	};
}

