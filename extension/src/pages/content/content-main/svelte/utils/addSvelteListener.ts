import { SvelteEventMap } from '@pages/content/content-main/svelte/svelte-types';

export function addSvelteListener<K extends keyof SvelteEventMap>(
	type: K,
	listener: (event: CustomEvent<SvelteEventMap[K]>) => void
) {
	window.addEventListener(type, listener);
	return () => window.removeEventListener(type, listener);
}
