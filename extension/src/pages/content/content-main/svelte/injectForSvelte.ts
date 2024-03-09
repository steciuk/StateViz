import { SvelteEventMap } from '@pages/content/content-main/svelte/svelte-types';
import { SvelteBlockType } from '@src/shared/types/svelte-types';
import {
	PostMessageBridge,
	PostMessageSource,
	PostMessageType,
} from '@pages/content/shared/PostMessageBridge';
import { getOrGenerateNodeId } from '../utils/getOrGenerateId';
import { NodeId, ParsedSvelteNode } from '@src/shared/types/ParsedNode';
import { Library } from '@src/shared/types/Library';

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

// TODO: type
const nodeMap = new Map<NodeId, any>();
// let currentBlock: unknown = null;

function handleSvelteDOMInsert(detail: SvelteEventMap['SvelteDOMInsert']) {
	const { target, node, anchor } = detail;

	function recursiveInsert(
		node: Node,
		parentId: NodeId | null
	): ParsedSvelteNode {
		const id = getOrGenerateNodeId(node);
		const type =
			node.nodeType === Node.ELEMENT_NODE
				? SvelteBlockType.element
				: node.nodeValue && node.nodeValue !== ' '
				  ? SvelteBlockType.text
				  : SvelteBlockType.anchor;

		const block: ParsedSvelteNode = {
			id,
			name: node.nodeName.toLowerCase(),
			type,
			children: [...node.childNodes].map((child) => recursiveInsert(child, id)),
		};

		nodeMap.set(id, {
			parentId,
			node: block,
		});

		return block;
	}

	// <div id="app"> is the target of root insert and it is not being added to the nodeMap
	const parentId = getOrGenerateNodeId(target);
	const block = recursiveInsert(node, parentId);
	const afterNode = anchor ? getOrGenerateNodeId(anchor) : null;

	const parentNode = nodeMap.get(parentId);

	if (!parentNode) {
		postMessageBridge.send({
			type: PostMessageType.MOUNT_ROOTS,
			content: [{ library: Library.SVELTE, root: block }],
		});
	} else {
		postMessageBridge.send({
			type: PostMessageType.MOUNT_NODES,
			content: [{ parentId, afterNode, node: block }],
		});
	}
}

function inject() {
	const listenerRemovers: (() => void)[] = [];

	// listenerRemovers.push(
	// 	addSvelteListener('SvelteRegisterComponent', ({ detail }) => {
	// 		console.log('SvelteRegisterComponent', detail);
	// 		const { component } = detail;

	// 		const id = getOrGenerateNodeId(component);
	// 		console.log(id);
	// 	})
	// );

	// listenerRemovers.push(
	// 	addSvelteListener('SvelteRegisterBlock', (event) => {
	// 		console.log('SvelteRegisterBlock', event.detail);
	// 	})
	// );

	listenerRemovers.push(
		addSvelteListener('SvelteDOMInsert', ({ detail }) => {
			console.log('SvelteDOMInsert', detail);
			handleSvelteDOMInsert(detail);
		})
	);

	// listenerRemovers.push(
	// 	addSvelteListener('SvelteDOMRemove', (event) => {
	// 		console.log('SvelteDOMRemove', event.detail);
	// 	})
	// );

	// listenerRemovers.push(
	// 	addSvelteListener('SvelteDOMAddEventListener', (event) => {
	// 		console.log('SvelteDOMAddEventListener', event.detail);
	// 	})
	// );

	// listenerRemovers.push(
	// 	addSvelteListener('SvelteDOMRemoveEventListener', (event) => {
	// 		console.log('SvelteDOMRemoveEventListener', event.detail);
	// 	})
	// );

	// listenerRemovers.push(
	// 	addSvelteListener('SvelteDOMSetData', (event) => {
	// 		console.log('SvelteDOMSetData', event.detail);
	// 	})
	// );

	// listenerRemovers.push(
	// 	addSvelteListener('SvelteDOMSetProperty', (event) => {
	// 		console.log('SvelteDOMSetProperty', event.detail);
	// 	})
	// );

	// listenerRemovers.push(
	// 	addSvelteListener('SvelteDOMSetAttribute', (event) => {
	// 		console.log('SvelteDOMSetAttribute', event.detail);
	// 	})
	// );

	// listenerRemovers.push(
	// 	addSvelteListener('SvelteDOMRemoveAttribute', (event) => {
	// 		console.log('SvelteDOMRemoveAttribute', event.detail);
	// 	})
	// );

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

