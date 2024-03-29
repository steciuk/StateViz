import { dehydrate } from '@pages/content/content-main/dehydrate';
import {
	Fiber,
	HookType,
	MemoizedState,
} from '@pages/content/content-main/react/react-types';
import { getFiberName } from '@pages/content/content-main/react/utils/getFiberName';
import {
	InspectData,
	NodeInspectedData,
	ReactInspectedData,
} from '@src/shared/types/DataType';
import { Library } from '@src/shared/types/Library';

export function getNodeData(fiber: Fiber): Omit<ReactInspectedData, 'id'> {
	// TODO: maybe try to check if changed and don't send if not
	const hooks = parseHooks(fiber);
	const props = parseProps(fiber);

	return {
		type: fiber.tag,
		name: getFiberName(fiber),
		library: Library.REACT,
		hooks,
		props,
	};
}

function parseProps(fiber: Fiber): ReactInspectedData['props'] {
	const props: NodeInspectedData['props'] = {};
	const fiberProps = fiber.memoizedProps;
	if (fiberProps) {
		for (const [key, value] of Object.entries(fiberProps)) {
			props[key] = dehydrate(value, 0);
		}
	}

	return props;
}

function parseHooks(fiber: Fiber): ReactInspectedData['hooks'] {
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
		hookType: hooksNames[index],
		data,
	}));
}

