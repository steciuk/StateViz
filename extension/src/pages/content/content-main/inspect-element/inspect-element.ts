import { EXISTING_NODES_DATA } from '@pages/content/content-main/hook-functions/on-commit/utils/existing-nodes-storage';
import { getOrGenerateNodeId } from '@pages/content/content-main/hook-functions/on-commit/utils/getOrGenerateNodeId';
import { Fiber } from '@pages/content/content-main/react-types';
import {
	PostMessageBridge,
	PostMessageSource,
	PostMessageType,
} from '@pages/content/shared/PostMessageBridge';
import {
	InspectedDataMessageContent,
	NodeInspectedData,
} from '@src/shared/chrome-messages/ChromeBridge';
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
			.map((id) => EXISTING_NODES_DATA.get(id)?.fiber)
			.filter((fiber): fiber is Fiber => fiber !== undefined);

		// did not find any fibers to inspect, maybe they were unmounted
		if (fibersToInspect.length === 0) return;

		fibersToInspect.forEach((fiber) => handleNodeInspect(fiber));
		sendInspectData();
	}
});

export function handleNodeInspect(fiber: Fiber) {
	const id = getOrGenerateNodeId(fiber);

	if (inspectedElementsIds.includes(id)) {
		INSPECTED_DATA_MAP.set(id, getNodeData(fiber));
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
	return {
		state: `Hello World! ${getOrGenerateNodeId(fiber)}`,
	};
}
