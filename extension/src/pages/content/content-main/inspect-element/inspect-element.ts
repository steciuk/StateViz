import { getOrGenerateNodeId } from '@pages/content/content-main/hook-functions/on-commit/utils/getOrGenerateNodeId';
import { Fiber } from '@pages/content/content-main/react-types';
import {
	PostMessageBridge,
	PostMessageSource,
	PostMessageType,
} from '@pages/content/shared/PostMessageBridge';
import { InspectedData } from '@src/shared/chrome-messages/ChromeBridge';
import { NodeId } from '@src/shared/types/ParsedFiber';

const postMessageBridge = PostMessageBridge.getInstance(PostMessageSource.MAIN);

let inspectedElementId: NodeId | null = null;
export const INSPECTED_DATA_MAP = new Map<NodeId, InspectedData>();

postMessageBridge.onMessage((message) => {
	if (message.type === PostMessageType.INSPECT_ELEMENT) {
		inspectedElementId = message.content;
	}
});

export function handleNodeInspect(fiber: Fiber) {
	const id = getOrGenerateNodeId(fiber);

	// TODO: handle inspected multiple nodes at once
	if (id === inspectedElementId) {
		INSPECTED_DATA_MAP.set(id, getNodeData(fiber));
	}
}

export function sendInspectData() {
	if (inspectedElementId) {
		const data = INSPECTED_DATA_MAP.get(inspectedElementId);

		if (!data) return;

		postMessageBridge.send({
			type: PostMessageType.INSPECTED_DATA,
			content: [
				{
					id: inspectedElementId,
					data: data,
				},
			],
		});
	}
}

function getNodeData(fiber: Fiber): InspectedData {
	return {
		state: `Hello World! ${getOrGenerateNodeId(fiber)}`,
	};
}
