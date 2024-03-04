import { unmountFiber } from '@pages/content/content-main/react/hook-functions/on-commit/utils/unmountFiber';
import { Fiber, RendererID } from '@pages/content/content-main/react/react-types';

export function onCommitFiberUnmount(
  rendererID: RendererID,
  fiber: Fiber
): void {
  console.log('unmount', fiber);
  unmountFiber(fiber);
}
