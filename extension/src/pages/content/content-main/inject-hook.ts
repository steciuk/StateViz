import { injectForReact } from '@pages/content/content-main/react/injectForReact';
import { ReactDevToolsHook } from '@pages/content/content-main/react/react-types';
import { injectForSvelte } from '@pages/content/content-main/svelte/injectForSvelte';
import { SvelteDevToolsHook } from '@pages/content/content-main/svelte/svelte-types';

declare global {
  interface Window {
    __REACT_DEVTOOLS_GLOBAL_HOOK__?: ReactDevToolsHook;
    __svelte?: SvelteDevToolsHook;
    // __REACT_DEVTOOLS_CONSOLE_FUNCTIONS__?: {
    // 	registerRendererWithConsole?: (renderer: any) => void;
    // 	patchConsoleUsingWindowValues?: () => void;
    // };
    // __REACT_DEVTOOLS_ATTACH__: any;
  }
}

export function injectHook() {
  injectForReact();
  injectForSvelte();
}
