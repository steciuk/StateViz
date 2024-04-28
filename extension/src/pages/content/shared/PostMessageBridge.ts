import { Library } from '@src/shared/types/Library';
import { NodeInspectedData } from '@src/shared/types/NodeInspectedData';
import {
	NodeId,
	ParsedNode,
	NodeAndLibrary,
} from '@src/shared/types/ParsedNode';

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
	HOVER_ELEMENT = 'HOVER_ELEMENT',
}

export type UnmountNodesOperation = {
	parentId: NodeId | null;
	id: NodeId;
};
export type MountNodesOperations<L extends Library> = Array<{
	parentId: NodeId;
	anchor: {
		type: 'before' | 'after';
		id: NodeId | null;
	};
	node: ParsedNode<L>;
}>;
export type MountRootsOperations<L extends Library> = NodeAndLibrary<L>[];
export type UpdateNodesOperations<L extends Library> = Array<
	Pick<ParsedNode<L>, 'id'> & Partial<Omit<ParsedNode<L>, 'id'>>
>;

// MESSAGE TYPES
export type LibraryAttachedPostMessage = {
	type: PostMessageType.LIBRARY_ATTACHED;
	content: Library;
};

export type MountRootsPostMessage<L extends Library = Library> = {
	type: PostMessageType.MOUNT_ROOTS;
	content: MountRootsOperations<L>;
};

export type MountNodesPostMessage<L extends Library = Library> = {
	type: PostMessageType.MOUNT_NODES;
	content: MountNodesOperations<L>;
};

export type UpdateNodesPostMessage<L extends Library = Library> = {
	type: PostMessageType.UPDATE_NODES;
	content: UpdateNodesOperations<L>;
};

export type UnmountNodesPostMessage = {
	type: PostMessageType.UNMOUNT_NODES;
	content: UnmountNodesOperation;
};

export type InspectedDataPostMessage = {
	type: PostMessageType.INSPECTED_DATA;
	content: NodeInspectedData[];
};

export type InspectElementPostMessage = {
	type: PostMessageType.INSPECT_ELEMENT;
	content: NodeId[];
};

export type HoverElementPostMessage = {
	type: PostMessageType.HOVER_ELEMENT;
	content: NodeId;
};

export type PostMessage<L extends Library = Library> =
	| LibraryAttachedPostMessage
	| MountRootsPostMessage<L>
	| MountNodesPostMessage<L>
	| UnmountNodesPostMessage
	| InspectElementPostMessage
	| InspectedDataPostMessage
	| UpdateNodesPostMessage<L>
	| HoverElementPostMessage;

type MessageWithSource<L extends Library = Library> = {
	source: PostMessageSource;
	message: PostMessage<L>;
};

export class PostMessageBridge {
	private constructor(private readonly source: PostMessageSource) {}
	private static instance?: PostMessageBridge;

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

	send<L extends Library>(message: PostMessage<L>) {
		window.postMessage(
			{
				source: this.source,
				message,
			},
			window.origin
		);
	}

	onMessage(callback: (message: PostMessage) => void): () => void {
		const eventListener = (event: MessageEvent<MessageWithSource>) => {
			if (event.origin !== window.origin) return;
			if (!event.data.source) return;
			if (event.data.source === this.source) return;

			callback(event.data.message);
		};

		window.addEventListener('message', eventListener);

		return () => {
			window.removeEventListener('message', eventListener);
		};
	}

	onMessageOnce(callback: (message: PostMessage) => void) {
		const eventListener = (event: MessageEvent<MessageWithSource>) => {
			if (event.origin !== window.origin) return;
			if (!event.data.source) return;
			if (event.data.source === this.source) return;

			window.removeEventListener('message', eventListener);
			callback(event.data.message);
		};

		window.addEventListener('message', eventListener);
	}
}

