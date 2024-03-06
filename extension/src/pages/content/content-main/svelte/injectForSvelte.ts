import { SvelteEventMap } from '@pages/content/content-main/svelte/svelte-types';
import {
	PostMessageBridge,
	PostMessageSource,
	PostMessageType,
} from '@pages/content/shared/PostMessageBridge';

declare global {
	interface Window {
		addEventListener<K extends keyof SvelteEventMap>(
			type: K,
			listener: (event: CustomEvent<SvelteEventMap[K]>) => void,
			options?: boolean | AddEventListenerOptions
		): void;
		removeEventListener<K extends keyof SvelteEventMap>(
			type: K,
			listener: (event: CustomEvent<SvelteEventMap[K]>) => void,
			options?: boolean | EventListenerOptions
		): void;
		dispatchEvent<K extends keyof SvelteEventMap>(
			type: K,
			event: CustomEvent<SvelteEventMap[K]>
		): void;
	}
}

const SUPPORTED_SVELTE_MAJOR = 4;
const postMessageBridge = PostMessageBridge.getInstance(PostMessageSource.MAIN);

export function injectForSvelte() {
	// pre-inject in order not to miss any events
	const removeAllListeners = inject();

	window.addEventListener('DOMContentLoaded', () => {
		const versions: number[] = [...(window.__svelte?.v ?? [])].map((v) => +v);

		if (versions.length === 0) {
			console.warn('No Svelte found');
			removeAllListeners();
			return;
		}

		if (!versions.some((v) => v >= SUPPORTED_SVELTE_MAJOR)) {
			console.warn('No supported Svelte versions found');
			removeAllListeners();
			return;
		}

		// let the content-isolated know that the library is attached
		postMessageBridge.send({
			type: PostMessageType.LIBRARY_ATTACHED,
		});
	});
}

function inject() {
	const listenerRemovers: (() => void)[] = [];

	listenerRemovers.push(
		addSvelteListener('SvelteRegisterComponent', (event) => {
			console.log('SvelteRegisterComponent', event.detail);
		})
	);

	listenerRemovers.push(
		addSvelteListener('SvelteRegisterBlock', (event) => {
			console.log('SvelteRegisterBlock', event.detail);
		})
	);

	listenerRemovers.push(
		addSvelteListener('SvelteDOMInsert', (event) => {
			console.log('SvelteDOMInsert', event.detail);
		})
	);

	listenerRemovers.push(
		addSvelteListener('SvelteDOMRemove', (event) => {
			console.log('SvelteDOMRemove', event.detail);
		})
	);

	listenerRemovers.push(
		addSvelteListener('SvelteDOMAddEventListener', (event) => {
			console.log('SvelteDOMAddEventListener', event.detail);
		})
	);

	listenerRemovers.push(
		addSvelteListener('SvelteDOMRemoveEventListener', (event) => {
			console.log('SvelteDOMRemoveEventListener', event.detail);
		})
	);

	listenerRemovers.push(
		addSvelteListener('SvelteDOMSetData', (event) => {
			console.log('SvelteDOMSetData', event.detail);
		})
	);

	listenerRemovers.push(
		addSvelteListener('SvelteDOMSetProperty', (event) => {
			console.log('SvelteDOMSetProperty', event.detail);
		})
	);

	listenerRemovers.push(
		addSvelteListener('SvelteDOMSetAttribute', (event) => {
			console.log('SvelteDOMSetAttribute', event.detail);
		})
	);

	listenerRemovers.push(
		addSvelteListener('SvelteDOMRemoveAttribute', (event) => {
			console.log('SvelteDOMRemoveAttribute', event.detail);
		})
	);

	return () => {
		listenerRemovers.forEach((remover) => remover());
		console.warn('All Svelte listeners removed');
	};
}

function addSvelteListener<K extends keyof SvelteEventMap>(
	type: K,
	listener: (event: CustomEvent<SvelteEventMap[K]>) => void
) {
	window.addEventListener(type, listener);
	return () => window.removeEventListener(type, listener);
}

