import {
	SvelteBlockDetail,
	SvelteComponentFragment,
	SvelteEventMap,
} from '@pages/content/content-main/svelte/svelte-types';
import { SvelteBlockType } from '@src/shared/types/svelte-types';
import {
	PostMessageBridge,
	PostMessageSource,
	PostMessageType,
} from '@pages/content/shared/PostMessageBridge';
import { getOrGenerateNodeId } from '../utils/getOrGenerateId';
import { NodeId, ParsedSvelteNode } from '@src/shared/types/ParsedNode';
import { Library } from '@src/shared/types/Library';
import { getRandomValues } from 'crypto';

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

type ExistingNodeData = {
	parentId: NodeId | null;
	containingBlockId: NodeId | null;
};
type PendingComponentData = { name: string };
const EXISTING_NODES = new Map<NodeId, ExistingNodeData>();
const PENDING_COMPONENTS = new Map<NodeId, PendingComponentData>();
const EACHES = new Map<NodeId, { id: NodeId; count: number }>();
let CURRENT_BLOCK_ID: NodeId | null = null;

function handleSvelteRegisterComponent(
	detail: SvelteEventMap['SvelteRegisterComponent']
) {
	const { component, tagName } = detail;
	const id = getOrGenerateNodeId(component.$$.fragment);

	if (PENDING_COMPONENTS.has(id)) {
		update({ id, name: tagName });
		PENDING_COMPONENTS.delete(id);
		return;
	}

	PENDING_COMPONENTS.set(id, { name: tagName });
}

function handleSvelteRegisterBlock(
	detail: SvelteEventMap['SvelteRegisterBlock']
) {
	const { type, block, ...rest } = detail;

	let id = getOrGenerateNodeId(block);

	if (block.m) {
		const original = block.m;

		// patch mount function
		block.m = (target, anchor) => {
			console.warn(CURRENT_BLOCK_ID);
			const previousBlockId = CURRENT_BLOCK_ID;

			const node: ParsedSvelteNode = {
				type,
				name: type,
				children: [],
				id,
			};

			switch (type) {
				case 'then':
				case 'catch':
					console.error('mounting then/catch block', detail);
					break;
				case 'slot':
					node.type = SvelteBlockType.slot;
					break;
				case 'component': {
					const component = PENDING_COMPONENTS.get(id);
					if (component) {
						node.name = component.name;
						PENDING_COMPONENTS.delete(id);
					} else {
						console.error('mounting unregistered component', detail);
						node.name = 'Unknown';
						PENDING_COMPONENTS.set(id, { name: 'Unknown' });
					}
					break;
				}
			}

			if (type === 'each') {
				if (previousBlockId === null) {
					console.error('each without parent block', detail);
				} else {
					let each = EACHES.get(previousBlockId);
					if (each === undefined) {
						each = { id, count: 0 };
						mount(node, target, previousBlockId, anchor);
					}

					id = each.id;
					EACHES.set(previousBlockId, { id: each.id, count: each.count + 1 });
				}
			} else {
				mount(node, target, previousBlockId, anchor);
			}

			CURRENT_BLOCK_ID = id;
			original(target, anchor);
			CURRENT_BLOCK_ID = previousBlockId;
		};
	}

	if (block.p) {
		const original = block.p;

		// patch patch function
		block.p = (changed, ctx) => {
			const parent = CURRENT_BLOCK_ID;

			CURRENT_BLOCK_ID = id;
			original(changed, ctx);
			CURRENT_BLOCK_ID = parent;
		};
	}

	if (block.d) {
		const original = block.d;

		block.d = (detaching) => {
			console.error('detaching', detail);
			if (type === 'each') {
				console.log('detaching each', detail, CURRENT_BLOCK_ID, id);
				if (CURRENT_BLOCK_ID === null) {
					console.error('each without parent block', detail);
					return;
				}

				let counter = EACHES.get(CURRENT_BLOCK_ID)?.count ?? 0;
				counter -= 1;

				if (counter <= 0) {
					EACHES.delete(CURRENT_BLOCK_ID);
					unmount(id);
				} else {
					EACHES.set(CURRENT_BLOCK_ID, { id, count: counter });
				}
			} else {
				unmount(id);
			}
			original(detaching);
		};
	}
}

function handleSvelteDOMInsert(detail: SvelteEventMap['SvelteDOMInsert']) {
	const { target, node, anchor } = detail;

	function recursiveInsert(node: Node): ParsedSvelteNode {
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
			children: [...node.childNodes].map((child) => recursiveInsert(child)),
		};

		return block;
	}

	// <div id="app"> is the target of root insert and it is not being added to the nodeMap
	const block = recursiveInsert(node);

	mount(block, target, CURRENT_BLOCK_ID, anchor);
}

function handleSvelteDOMRemove(detail: SvelteEventMap['SvelteDOMRemove']) {
	const { node } = detail;
	const id = getOrGenerateNodeId(node);
	unmount(id);
}

function unmount(id: NodeId) {
	const nodeInfo = EXISTING_NODES.get(id);

	if (!nodeInfo) {
		console.error('node not found');
		return;
	}

	EXISTING_NODES.delete(id);

	let sendUpdates = true;
	let parentId = nodeInfo.parentId;

	while (parentId !== null) {
		const parent = EXISTING_NODES.get(parentId);

		if (parent === undefined) {
			sendUpdates = false;
			break;
		}

		parentId = parent.parentId;
	}

	if (sendUpdates) {
		postMessageBridge.send({
			type: PostMessageType.UNMOUNT_NODES,
			content: {
				parentId: nodeInfo.parentId,
				id,
			},
		});
	}
}

function update(node: { id: NodeId; name: string }) {
	postMessageBridge.send({
		type: PostMessageType.UPDATE_NODES,
		content: [node],
	});
}

function mount(
	node: ParsedSvelteNode,
	target: Node,
	containingBlockId: NodeId | null,
	anchor?: Node
) {
	let targetId = getOrGenerateNodeId(target);
	const targetNode = EXISTING_NODES.get(targetId);

	if (
		// we have not inserted the target
		!targetNode ||
		// or current node has a different containing block than its target
		// i.e. there is a Svelte block between them
		containingBlockId !== targetNode.containingBlockId
	) {
		if (containingBlockId === null) {
			// we are not processing any block, node has to be the root
			postMessageBridge.send({
				type: PostMessageType.MOUNT_ROOTS,
				content: [{ library: Library.SVELTE, root: node }],
			});

			EXISTING_NODES.set(node.id, {
				parentId: null,
				containingBlockId: null,
			});
			return;
		}

		// mount under current block
		targetId = containingBlockId;
	}

	const anchorId = anchor ? getOrGenerateNodeId(anchor) : null;

	postMessageBridge.send({
		type: PostMessageType.MOUNT_NODES,
		content: [
			{
				parentId: targetId,
				anchor: { type: 'before', id: anchorId },
				node: node,
			},
		],
	});

	EXISTING_NODES.set(node.id, {
		parentId: targetId,
		containingBlockId: containingBlockId,
	});
}

function inject() {
	const listenerRemovers: (() => void)[] = [];

	listenerRemovers.push(
		addSvelteListener('SvelteRegisterComponent', ({ detail }) => {
			console.log('SvelteRegisterComponent', detail);
			handleSvelteRegisterComponent(detail);
		})
	);

	listenerRemovers.push(
		addSvelteListener('SvelteRegisterBlock', ({ detail }) => {
			console.log('SvelteRegisterBlock', detail);
			handleSvelteRegisterBlock(detail);
		})
	);

	listenerRemovers.push(
		addSvelteListener('SvelteDOMInsert', ({ detail }) => {
			console.log('SvelteDOMInsert', detail);
			handleSvelteDOMInsert(detail);
		})
	);

	listenerRemovers.push(
		addSvelteListener('SvelteDOMRemove', ({ detail }) => {
			console.log('SvelteDOMRemove', detail);
			handleSvelteDOMRemove(detail);
		})
	);

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

