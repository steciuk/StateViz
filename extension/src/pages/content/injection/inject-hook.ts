import { inject } from '@pages/content/injection/hook-functions/inject';
import { emit, off, on, sub } from '@pages/content/injection/hook-functions/listeners';
import {
	LISTENERS,
	RENDERER_INTERFACES,
	RENDERERS
} from '@pages/content/injection/hook-storage/hook-storage';
import { DevToolsHook } from '@pages/content/injection/react-types';

declare global {
	interface Window {
		__REACT_DEVTOOLS_GLOBAL_HOOK__?: DevToolsHook; // TODO: switch to DevToolsHook type
		__REACT_DEVTOOLS_CONSOLE_FUNCTIONS__?: {
			registerRendererWithConsole?: (renderer: any) => void;
			patchConsoleUsingWindowValues?: () => void;
		};
		__REACT_DEVTOOLS_ATTACH__: any;
	}
}

export function injectHook() {
	const reactHook = window.__REACT_DEVTOOLS_GLOBAL_HOOK__;

	// Check if RTD or StateViz already hooked
	if (reactHook) {
		if (reactHook.stateViz) {
			console.warn('StateViz already hooked');
			return;
		} else {
			// TODO: consider integrating with RDT
			console.warn('React DevTools already hooked. Disable it to use StateViz');
			return;
		}
	}

	// Hook StateViz
	window.__REACT_DEVTOOLS_GLOBAL_HOOK__ = {
		stateViz: true,
		rendererInterfaces: RENDERER_INTERFACES,
		listeners: LISTENERS.expose(),
		backends: new Map(),
		renderers: RENDERERS,
		supportsFiber: true,

		inject: inject,
		emit: emit,
		getFiberRoots: (rendererId: number) => {
			console.log('getFiberRoots', rendererId);
		},
		on: on,
		off: off,
		sub: sub,
		onCommitFiberUnmount: (rendererId: number, fiber: any) => {
			console.log('onCommitFiberUnmount', rendererId, fiber);
		},
		onCommitFiberRoot: (rendererID: any, root: any, priorityLevel: void | number) => {
			console.log('onCommitFiberRoot', rendererID, root, priorityLevel);
			console.log(RENDERER_INTERFACES);
		},
		onPostCommitFiberRoot: (rendererID: number, root: any) => {
			console.log('onPostCommitFiberRoot', rendererID, root);
		},
		setStrictMode: (rendererID: number, isStrict: any) => {
			// console.log('setStrictMode', rendererID, isStrict);
		},
		// probably only for profiler
		getInternalModuleRanges: () => {
			// console.log('getInternalModuleRanges');
			return [];
		},
		registerInternalModuleStart: (moduleStartError: Error) => {
			// console.log('registerInternalModuleStart', moduleStartError);
		},
		registerInternalModuleStop: (moduleStopError: Error) => {
			// console.log('registerInternalModuleStop', moduleStopError);
		},
	};
}
