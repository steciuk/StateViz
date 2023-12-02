import { InspectedDataMessageContent } from '@src/shared/chrome-messages/ChromeBridge';
import { NodeId, ParsedFiber } from '@src/shared/types/ParsedFiber';
import { OmitFromUnion } from '@src/shared/utility-types';

export enum PostMessageSource {
	ISOLATED = 'ISOLATED',
	MAIN = 'MAIN',
}

export enum PostMessageType {
	REACT_ATTACHED = 'REACT_ATTACHED',
	UNMOUNT_NODES = 'UNMOUNT_NODES',
	MOUNT_NODES = 'MOUNT_NODES',
	INSPECT_ELEMENT = 'INSPECT_ELEMENT',
	INSPECTED_DATA = 'INSPECTED_DATA',
}

type ReactAttachedPostMessage = {
	source: PostMessageSource.MAIN;
	type: PostMessageType.REACT_ATTACHED;
	content?: undefined;
};

export type UnmountNodesOperation = NodeId[];
export type MountNodesOperations = Array<{
	pathFromRoot: NodeId[];
	afterNode: NodeId | null;
	node: ParsedFiber;
}>;

type MountNodesPostMessage = {
	source: PostMessageSource.MAIN;
	type: PostMessageType.MOUNT_NODES;
	content: MountNodesOperations;
};

type UnmountNodesPostMessage = {
	source: PostMessageSource.MAIN;
	type: PostMessageType.UNMOUNT_NODES;
	content: UnmountNodesOperation;
};

type InspectElementPostMessage = {
	source: PostMessageSource.ISOLATED;
	type: PostMessageType.INSPECT_ELEMENT;
	content: NodeId[];
};

type InspectedDataPostMessage = {
	source: PostMessageSource.MAIN;
	type: PostMessageType.INSPECTED_DATA;
	content: InspectedDataMessageContent;
};

type PostMessage =
	| ReactAttachedPostMessage
	| MountNodesPostMessage
	| UnmountNodesPostMessage
	| InspectElementPostMessage
	| InspectedDataPostMessage;

export class PostMessageBridge {
	private constructor(private source: PostMessageSource) {}
	private static instance: PostMessageBridge | undefined;

	static getInstance(source: PostMessageSource) {
		if (!PostMessageBridge.instance) {
			PostMessageBridge.instance = new PostMessageBridge(source);
		}

		if (PostMessageBridge.instance.source !== source) {
			throw new Error(
				'PostMessageBridge already initialized with different source'
			);
		}

		return PostMessageBridge.instance;
	}

	send(message: OmitFromUnion<PostMessage, 'source'>) {
		window.postMessage(
			{
				source: this.source,
				...message,
			},
			window.origin
		);
	}

	onMessage(callback: (message: PostMessage) => void): () => void {
		const eventListener = (event: MessageEvent<PostMessage>) => {
			if (event.origin !== window.origin) return;
			if (event.data.source === this.source) return;

			callback(event.data);
		};

		window.addEventListener('message', eventListener);

		return () => {
			window.removeEventListener('message', eventListener);
		};
	}

	onMessageOnce(callback: (message: PostMessage) => void) {
		window.addEventListener(
			'message',
			(event: MessageEvent<PostMessage>) => {
				if (event.origin !== window.origin) return;
				if (event.data.source !== this.source) return;

				callback(event.data);
			},
			{ once: true }
		);
	}
}
