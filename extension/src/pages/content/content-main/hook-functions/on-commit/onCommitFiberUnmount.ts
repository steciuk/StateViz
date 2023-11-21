import { unmountFiber } from '@pages/content/content-main/hook-functions/on-commit/utils/unmountFiber';
import { RendererID, Fiber } from '@pages/content/content-main/react-types';

export function onCommitFiberUnmount(
	rendererID: RendererID,
	fiber: Fiber
): void {
	console.log('unmount', fiber);
	unmountFiber(fiber);
}
