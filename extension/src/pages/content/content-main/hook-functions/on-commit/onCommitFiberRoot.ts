import { getOrGenerateNodeId } from '@pages/content/content-main/fiber-parser/node-map';
import { getNodesUpdates } from '@pages/content/content-main/hook-functions/on-commit/utils/getNodesUpdates';
import { mountNewRoot } from '@pages/content/content-main/hook-functions/on-commit/utils/mountNewRoot';
import { sendMountOperations } from '@pages/content/content-main/hook-functions/on-commit/utils/send-operations';
import { unmountFiber } from '@pages/content/content-main/hook-functions/on-commit/utils/unmountFiber';
import {
	Fiber,
	FiberRoot,
	RendererID,
} from '@pages/content/content-main/react-types';

export function onCommitFiberRoot(
	rendererID: RendererID,
	root: FiberRoot,
	_priorityLevel?: number,
	_didError?: boolean
): void {
	const current = root.current;
	const alternate = current.alternate;

	// doesn't have alternate. New root mount for sure.
	if (!alternate) {
		return mountNewRoot(current);
	}

	// has alternate. Either a new root mount, unmount or an update.
	const wasMounted =
		alternate.memoizedState !== null &&
		alternate.memoizedState.element !== null &&
		alternate.memoizedState.isDehydrated !== true;
	const isMounted =
		current.memoizedState != null &&
		current.memoizedState.element != null &&
		current.memoizedState.isDehydrated !== true;

	if (!wasMounted && isMounted) {
		// ? Mount a new root.
		console.log('mount new root');
		return mountNewRoot(current);
	}
	if (wasMounted && isMounted) {
		// ? Update an existing root.
		console.log('update existing root');
		return updateRoot(current, alternate);
	}
	if (wasMounted && !isMounted) {
		// ? Unmount an existing root.
		console.log('unmount existing root');
		return unmountFiber(current);
	}
}

function updateRoot(current: Fiber, alternate: Fiber): void {
	const operations = getNodesUpdates(current, alternate, [
		getOrGenerateNodeId(current),
	]);
	if (operations.length === 0) return;
	sendMountOperations(operations);
}
