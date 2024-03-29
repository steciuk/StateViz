import { InspectedDataMessageContent } from '@src/shared/chrome-messages/ChromeBridge';
import {
	NodeId,
	ParsedNode,
	NodeAndLibrary,
} from '@src/shared/types/ParsedNode';
import { OmitFromUnion } from '@src/shared/utility-types';

export enum PostMessageSource {
	ISOLATED = 'ISOLATED',
	MAIN = 'MAIN',
}

export enum PostMessageType {
	LIBRARY_ATTACHED = 'LIBRARY_ATTACHED',
	UNMOUNT_NODES = 'UNMOUNT_NODES',
	MOUNT_NODES = 'MOUNT_NODES',
	MOUNT_ROOTS = 'MOUNT_ROOTS',
	UPDATE_NODES = 'UPDATE_NODES',
	INSPECT_ELEMENT = 'INSPECT_ELEMENT',
	INSPECTED_DATA = 'INSPECTED_DATA',
}

export type UnmountNodesOperation = {
	parentId: NodeId | null;
	id: NodeId;
};
export type MountNodesOperations = Array<{
	parentId: NodeId;
	anchor: {
		type: 'before' | 'after';
		id: NodeId | null;
	};
	node: ParsedNode;
}>;
export type MountRootsOperations = NodeAndLibrary[];
export type UpdateNodesOperations = Array<
	Partial<ParsedNode> & Pick<ParsedNode, 'id'>
>;

// MESSAGE TYPES
export type LibraryAttachedPostMessage = {
	source: PostMessageSource.MAIN;
	type: PostMessageType.LIBRARY_ATTACHED;
	content?: undefined;
};

export type MountRootsPostMessage = {
	source: PostMessageSource.MAIN;
	type: PostMessageType.MOUNT_ROOTS;
	content: MountRootsOperations;
};

export type MountNodesPostMessage = {
	source: PostMessageSource.MAIN;
	type: PostMessageType.MOUNT_NODES;
	content: MountNodesOperations;
};

export type UpdateNodesPostMessage = {
	source: PostMessageSource.MAIN;
	type: PostMessageType.UPDATE_NODES;
	content: UpdateNodesOperations;
};

export type UnmountNodesPostMessage = {
	source: PostMessageSource.MAIN;
	type: PostMessageType.UNMOUNT_NODES;
	content: UnmountNodesOperation;
};

export type InspectedDataPostMessage = {
	source: PostMessageSource.MAIN;
	type: PostMessageType.INSPECTED_DATA;
	content: InspectedDataMessageContent;
};

export type InspectElementPostMessage = {
	source: PostMessageSource.ISOLATED;
	type: PostMessageType.INSPECT_ELEMENT;
	content: NodeId[];
};

export type PostMessage =
	| LibraryAttachedPostMessage
	| MountRootsPostMessage
	| MountNodesPostMessage
	| UnmountNodesPostMessage
	| InspectElementPostMessage
	| InspectedDataPostMessage
	| UpdateNodesPostMessage;

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
			if (!event.data.source) return;
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
				if (!event.data.source) return;
				if (event.data.source === this.source) return;

				callback(event.data);
			},
			{ once: true }
		);
	}
}

