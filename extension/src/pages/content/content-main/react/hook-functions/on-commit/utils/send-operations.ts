import {
	MountNodesOperations,
	MountRootsOperations,
	PostMessageBridge,
	PostMessageSource,
	PostMessageType,
	UnmountNodesOperation,
} from '@pages/content/shared/PostMessageBridge';

const postMessageBridge = PostMessageBridge.getInstance(PostMessageSource.MAIN);

export function sendMountRootsOperations(
	operations: MountRootsOperations
): void {
	postMessageBridge.send({
		type: PostMessageType.MOUNT_ROOTS,
		content: operations,
	});
}

export function sendMountNodesOperations(
	operations: MountNodesOperations
): void {
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

