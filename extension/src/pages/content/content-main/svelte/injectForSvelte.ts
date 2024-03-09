import {
	SvelteBlockType,
	SvelteEventMap,
} from '@pages/content/content-main/svelte/svelte-types';
import {
	PostMessageBridge,
	PostMessageSource,
	PostMessageType,
} from '@pages/content/shared/PostMessageBridge';
import { getOrGenerateNodeId } from '@pages/content/content-main/svelte/getOrGenerateNodeId';
import { NodeId } from '@src/shared/types/ParsedFiber';

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

type SvelteNode = {
	id: NodeId;
	name: string;
	type: SvelteBlockType;
	children: SvelteNode[];
};

type SvelteNodeData = {
	pathFromRoot: NodeId[];
	parentId: NodeId | null;
	node: SvelteNode;
};

type SendNodeData = {
	pathFromRoot: NodeId[];
	afterNode: NodeId | null;
	node: SvelteNode;
};

const nodeMap = new Map<NodeId, SvelteNodeData>();
// let currentBlock: unknown = null;

function handleSvelteDOMInsert(detail: SvelteEventMap['SvelteDOMInsert']) {
	const { target, node, anchor } = detail;

	function recursiveInsert(
		node: Node,
		parentId: NodeId | null,
		pathFromRoot: NodeId[]
	): SvelteNode {
		const id = getOrGenerateNodeId(node);
		const type =
			node.nodeType === Node.ELEMENT_NODE
				? SvelteBlockType.element
				: node.nodeValue && node.nodeValue !== ' '
				  ? SvelteBlockType.text
				  : SvelteBlockType.anchor;

		const block: SvelteNode = {
			id,
			name: node.nodeName.toLowerCase(),
			type,
			children: [...node.childNodes].map((child) =>
				recursiveInsert(child, id, [...pathFromRoot, id])
			),
		};

		nodeMap.set(id, {
			pathFromRoot,
			parentId,
			node: block,
		});

		return block;
	}

	// <div id="app"> is the target of root insert and it is not being added to the nodeMap
	const parentId = getOrGenerateNodeId(target);
	const parentNode = nodeMap.get(parentId);
	const pathFromRoot = parentNode ? [...parentNode.pathFromRoot, parentId] : [];
	const block = recursiveInsert(node, parentId, pathFromRoot);
	const afterNode = anchor ? getOrGenerateNodeId(anchor) : null;

	send({
		pathFromRoot,
		afterNode,
		node: block,
	});
}

const roots: SvelteNode[] = [];
function send(data: SendNodeData) {
	console.log('send', data);
	if (data.pathFromRoot.length === 0) {
		roots.push(data.node);
	} else {
		const [rootId, ...restOfPath] = data.pathFromRoot;
		const root = roots.find((root) => root.id === rootId);

		if (!root) {
			console.error('root not found');
			console.log(rootId);
			return;
		}

		// traverse the tree to find the parent node
		let current = root;
		for (const nodeId of restOfPath) {
			const child = current.children.find((child) => child.id === nodeId);
			if (!child) {
				console.error('child not found');
				return;
			}

			current = child;
		}

		if (data.afterNode === null) {
			current.children.unshift(data.node);
		} else {
			const afterNodeIndex = current.children.findIndex(
				(child) => child.id === data.afterNode
			);
			if (afterNodeIndex === -1) {
				console.error('afterNode not found');
				return;
			}

			// Insert after the afterNode
			current.children.splice(afterNodeIndex + 1, 0, data.node);
		}
	}

	console.warn(roots);
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

