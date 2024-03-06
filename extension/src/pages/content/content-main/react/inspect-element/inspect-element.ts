import { EXISTING_FIBERS_DATA } from '@pages/content/content-main/react/hook-functions/on-commit/utils/existing-nodes-storage';
import { getOrGenerateFiberId } from '@pages/content/content-main/react/hook-functions/on-commit/utils/getOrGenerateFiberId';
import { typeData } from '@pages/content/content-main/react/inspect-element/getDataType';
import {
	Fiber,
	HookType,
	MemoizedState,
} from '@pages/content/content-main/react/react-types';
import {
	PostMessageBridge,
	PostMessageSource,
	PostMessageType,
} from '@pages/content/shared/PostMessageBridge';
import { InspectedDataMessageContent } from '@src/shared/chrome-messages/ChromeBridge';
import {
	DataType,
	InspectData,
	NodeInspectedData,
} from '@src/shared/types/DataType';
import { NodeId } from '@src/shared/types/ParsedFiber';

const postMessageBridge = PostMessageBridge.getInstance(PostMessageSource.MAIN);

let inspectedElementsIds: NodeId[] = [];
export const INSPECTED_DATA_MAP = new Map<NodeId, NodeInspectedData>();

postMessageBridge.onMessage((message) => {
	// Request to inspect nodes
	if (message.type === PostMessageType.INSPECT_ELEMENT) {
		inspectedElementsIds = message.content;
		console.log('INSPECT_ELEMENT', inspectedElementsIds);
		// if empty array it means that front stopped inspecting
		if (inspectedElementsIds.length === 0) return;

		const fibersToInspect = inspectedElementsIds
			.map((id) => EXISTING_FIBERS_DATA.get(id)?.fiber)
			.filter((fiber): fiber is Fiber => fiber !== undefined);

		// did not find any fibers to inspect, maybe they were unmounted
		if (fibersToInspect.length === 0) return;

		fibersToInspect.forEach((fiber) => handleNodeInspect(fiber));
		sendInspectData();
	}
});

export function handleNodeInspect(fiber: Fiber) {
	const id = getOrGenerateFiberId(fiber);

	if (inspectedElementsIds.includes(id)) {
		console.log(fiber);
		const nodeData = getNodeData(fiber);
		if (nodeData) {
			INSPECTED_DATA_MAP.set(id, nodeData);
		}
	}
}

export function sendInspectData() {
	const data: InspectedDataMessageContent = [];
	inspectedElementsIds.forEach((id) => {
		const inspectedData = INSPECTED_DATA_MAP.get(id);
		if (inspectedData) {
			data.push({
				id,
				data: inspectedData,
			});
		}
	});

	if (data.length === 0) return;

	postMessageBridge.send({
		type: PostMessageType.INSPECTED_DATA,
		content: data,
	});
}

function getNodeData(fiber: Fiber): NodeInspectedData {
	// TODO: maybe try to check if changed and don't send if not
	const hooks = parseHooks(fiber);
	const props = parseProps(fiber);

	return {
		hooks,
		props,
	};
}

function parseProps(fiber: Fiber): NodeInspectedData['props'] {
	const props: NodeInspectedData['props'] = {};
	const fiberProps = fiber.memoizedProps;
	if (fiberProps) {
		for (const [key, value] of Object.entries(fiberProps)) {
			props[key] = dehydrate(value, 0);
		}
	}

	return props;
}

function parseHooks(fiber: Fiber): NodeInspectedData['hooks'] {
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

const MAX_DEPTH = 5;
function dehydrate(value: unknown, depth: number): InspectData {
	if (depth > MAX_DEPTH) {
		return { type: 'MAX_DEPTH' };
	}

	const typedData = typeData(value);

	switch (typedData.type) {
		case DataType.NULL:
		case DataType.UNDEFINED:
		case DataType.NAN:
		case DataType.INFINITY:
			return { type: typedData.type };
		case DataType.NUMBER:
		case DataType.BOOLEAN:
		case DataType.STRING:
			return { type: typedData.type, data: typedData.data } as InspectData; // TODO: why is this needed?
		case DataType.SYMBOL:
		case DataType.BIGINT:
		case DataType.REGEXP:
			return { type: typedData.type, data: typedData.data.toString() };
		case DataType.DATE:
			return { type: typedData.type, data: typedData.data.toDateString() };
		// TODO: maybe consider sending more data about HTML elements
		case DataType.HTML_ELEMENT:
			return { type: typedData.type, data: typedData.data.tagName };
		case DataType.HTML_ALL_COLLECTION: {
			const data: string[] = [];
			for (const a of typedData.data) {
				data.push(a.tagName);
			}
			return { type: typedData.type, data };
		}
		case DataType.REACT_ELEMENT: {
			const reactElementType = typedData.data.type;
			if (typeof reactElementType === 'string') {
				return { type: typedData.type, data: reactElementType };
			} else {
				return { type: typedData.type, data: reactElementType.name };
			}
		}
		case DataType.ARRAY: {
			const data: InspectData[] = [];
			for (const a of typedData.data) {
				data.push(dehydrate(a, depth + 1));
			}
			return { type: typedData.type, data };
		}
		// TODO: check if this is what I want
		case DataType.OBJECT:
		case DataType.CLASS_INSTANCE: {
			const data: Record<string, InspectData> = {};
			for (const [key, value] of Object.entries(typedData.data)) {
				data[key] = dehydrate(value, depth + 1);
			}
			return { type: typedData.type, data };
		}
		case DataType.FUNCTION: {
			const func = typedData.data;
			return {
				type: typedData.type,
				data: `ƒ ${typeof func.name === 'function' ? '' : func.name}() {}`,
			};
		}

		// TODO: implement
		case DataType.TYPED_ARRAY:
		case DataType.ARRAY_BUFFER:
		case DataType.DATA_VIEW:
		case DataType.ITERATOR:
		case DataType.OPAQUE_ITERATOR:
			return { type: typedData.type };

		// UNKNOWN
		default:
			return { type: typedData.type };
	}
}

