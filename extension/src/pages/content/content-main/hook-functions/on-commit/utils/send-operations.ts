import {
	MountNodesOperations,
	PostMessageBridge,
	PostMessageSource,
	PostMessageType,
	UnmountNodesOperation,
} from '@pages/content/shared/PostMessageBridge';

const postMessageBridge = PostMessageBridge.getInstance(PostMessageSource.MAIN);

export function sendMountOperations(operations: MountNodesOperations): void {
	postMessageBridge.send({
		type: PostMessageType.MOUNT_NODES,
		content: operations,
	});
}

export function sendUnmountOperations(operations: UnmountNodesOperation): void {
	postMessageBridge.send({
		type: PostMessageType.UNMOUNT_NODES,
		content: operations,
	});
}
