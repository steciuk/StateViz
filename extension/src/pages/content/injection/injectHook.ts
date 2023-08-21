import { inject } from '@pages/content/injection/hookFunctions/inject';
import { DevToolsHook } from '@pages/content/injection/reactTypes';

declare global {
	interface Window {
		__REACT_DEVTOOLS_GLOBAL_HOOK__?: DevToolsHook; // TODO: switch to DevToolsHook type
		__REACT_DEVTOOLS_CONSOLE_FUNCTIONS__?: {
			registerRendererWithConsole?: (renderer: any) => void;
			patchConsoleUsingWindowValues?: () => void;
		};
	}
}

// Initialization
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
		rendererInterfaces: new Map(),
		listeners: {},
		backends: new Map(),
		// renderers: new Map(),
		supportsFiber: true,

		inject: inject,
		emit: (event: string, data: any) => {
			console.log('emit', event, data);
		},
		getFiberRoots: (rendererId: number) => {
			console.log('getFiberRoots', rendererId);
		},
		on: (event: string, listener: any) => {
			console.log('on', event, listener);
		},
		off: (event: string, listener: any) => {
			console.log('off', event, listener);
		},
		sub: (event: string, listener: any) => {
			console.log('sub', event, listener);
		},
		onCommitFiberUnmount: (rendererId: number, fiber: any) => {
			console.log('onCommitFiberUnmount', rendererId, fiber);
		},
		onCommitFiberRoot: (rendererID: any, root: any, priorityLevel: void | number) => {
			console.log('onCommitFiberRoot', rendererID, root, priorityLevel);
		},
		onPostCommitFiberRoot: (rendererID: number, root: any) => {
			console.log('onPostCommitFiberRoot', rendererID, root);
		},
		setStrictMode: (rendererID: number, isStrict: any) => {
			console.log('setStrictMode', rendererID, isStrict);
		},
		getInternalModuleRanges: () => {
			console.log('getInternalModuleRanges');
		},
		registerInternalModuleStart: (moduleStartError: Error) => {
			console.log('registerInternalModuleStart', moduleStartError);
		},
		registerInternalModuleStop: (moduleStopError: Error) => {
			console.log('registerInternalModuleStop', moduleStopError);
		},
	};
}
