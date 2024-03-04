import { inject } from '@pages/content/content-main/react/hook-functions/inject';
import { onCommitFiberRoot } from '@pages/content/content-main/react/hook-functions/on-commit/onCommitFiberRoot';
import { onCommitFiberUnmount } from '@pages/content/content-main/react/hook-functions/on-commit/onCommitFiberUnmount';
import { RENDERERS } from '@pages/content/content-main/react/hook-functions/utils/hook-storage';

export function injectForReact() {
  const reactHook = window.__REACT_DEVTOOLS_GLOBAL_HOOK__;

  // Check if RTD or StateViz already hooked
  if (reactHook) {
    if (reactHook.stateViz) {
      console.error('StateViz for React already hooked');
      return;
    } else {
      // TODO: consider integrating with RDT
      console.error(
        'React DevTools already hooked. Disable it to use StateViz for React'
      );
      return;
    }
  }

  // Hook StateViz for React
  window.__REACT_DEVTOOLS_GLOBAL_HOOK__ = {
    stateViz: true,
    // rendererInterfaces: RENDERER_INTERFACES,
    // listeners: LISTENERS.expose(),
    // backends: new Map(),
    // without this react breaks
    renderers: RENDERERS,
    supportsFiber: true,

    inject: inject,
    // emit: emit,
    // getFiberRoots: (rendererId: number) => {
    // 	// Not yet used
    // 	let fiber_roots = FIBER_ROOTS.get(rendererId);
    // 	if (!fiber_roots) {
    // 		fiber_roots = new Set();
    // 		FIBER_ROOTS.set(rendererId, fiber_roots);
    // 	}

    // 	return fiber_roots;
    // },
    // on: on,
    // off: off,
    // sub: sub,
    // used to dismiss the "Download the React DevTools" banner shown by React
    checkDCE: () => {
      return;
    },
    onCommitFiberUnmount: onCommitFiberUnmount,
    onCommitFiberRoot: onCommitFiberRoot,
    // onPostCommitFiberRoot: (rendererID: number, root: any) => {
    // 	// console.log('onPostCommitFiberRoot', rendererID, root);
    // },
    // setStrictMode: (rendererID: number, isStrict: any) => {
    // 	// console.log('setStrictMode', rendererID, isStrict);
    // },
    // probably only for profiler
    // getInternalModuleRanges: () => {
    //	// console.log('getInternalModuleRanges');
    // 	return [];
    // },
    // registerInternalModuleStart: (moduleStartError: Error) => {
    // 	// console.log('registerInternalModuleStart', moduleStartError);
    // },
    // registerInternalModuleStop: (moduleStopError: Error) => {
    // 	// console.log('registerInternalModuleStop', moduleStopError);
    // },
  };
}