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
const EACHES = new Map<NodeId, NodeId>();
let currentBlockId: NodeId | null = null;

function handleSvelteRegisterComponent(
	detail: SvelteEventMap['SvelteRegisterComponent']
) {
	const { component, tagName } = detail;
	const id = getOrGenerateNodeId(component.$$.fragment);

	if (PENDING_COMPONENTS.has(id)) {
		console.error('re-register of a component');
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
			console.warn(currentBlockId);
			const parentId = currentBlockId;

			const node: ParsedSvelteNode = {
				type,
				name: type,
				children: [],
				id,
			};

			switch (type) {
				case SvelteBlockType.then:
				case SvelteBlockType.catch:
				case SvelteBlockType.slot:
					console.error(type, 'not implemented', detail); //TODO: implement
					break;

				case SvelteBlockType.component: {
					const component = PENDING_COMPONENTS.get(id);
					if (component) {
						node.name = component.name;
						PENDING_COMPONENTS.delete(id);
					} else {
						console.error('mounting unregistered component', detail);
						node.name = 'Unknown';
					}
					break;
				}
				default:
					console.error(type, 'default', detail); //TODO: implement
			}

			if (type === SvelteBlockType.each) {
				if (parentId === null) {
					console.error('each outside a block');
					return; // FIXME: original not called
				}

				const currentBlocksEachId = EACHES.get(parentId);
				if (currentBlocksEachId === undefined) {
					EACHES.set(parentId, id);
					mount({ ...node, containingBlockId: currentBlockId }, target, anchor);
				} else {
					id = currentBlocksEachId;
				}
			} else {
				mount({ ...node, containingBlockId: currentBlockId }, target, anchor);
			}

			EXISTING_NODES.set(id, {
				parentId: getOrGenerateNodeId(target),
				containingBlockId: currentBlockId,
			});

			currentBlockId = id;
			original(target, anchor);
			currentBlockId = parentId;
		};
	}

	if (block.p) {
		const original = block.p;

		// patch patch function
		block.p = (changed, ctx) => {
			console.warn(currentBlockId);
			const parent = currentBlockId;
			currentBlockId = id;
			console.error('update current block? in patch', detail);

			original(changed, ctx);
			currentBlockId = parent;
		};
	}

	if (block.d) {
		const original = block.d;

		block.d = (detaching) => {
			console.error('detaching', detail);
			const nodeInfo = EXISTING_NODES.get(id);
			if (!nodeInfo) {
				console.error('node already detached?', id);
				return; // FIXME: not calling 'original'
			}

			postMessageBridge.send({
				type: PostMessageType.UNMOUNT_NODES,
				content: {
					parentId: nodeInfo.parentId,
					id,
				},
			});

			original(detaching);
		};
	}
}

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

		EXISTING_NODES.set(id, {
			parentId,
			containingBlockId: currentBlockId,
		});

		return block;
	}

	// <div id="app"> is the target of root insert and it is not being added to the nodeMap
	const parentId = getOrGenerateNodeId(target);
	const block = recursiveInsert(node, parentId);

	mount({ ...block, containingBlockId: currentBlockId }, target, anchor);
}

function handleSvelteDOMRemove(detail: SvelteEventMap['SvelteDOMRemove']) {
	const { node } = detail;
	const id = getOrGenerateNodeId(node);
	const nodeInfo = EXISTING_NODES.get(id);

	if (!nodeInfo) {
		console.error('node not found');
		return;
	}

	EXISTING_NODES.delete(id);

	postMessageBridge.send({
		type: PostMessageType.UNMOUNT_NODES,
		content: {
			parentId: nodeInfo.parentId,
			id,
		},
	});
}

function mount(
	node: ParsedSvelteNode & { containingBlockId: NodeId | null },
	target: Node,
	anchor?: Node
) {
	const { containingBlockId } = node;
	let targetId = getOrGenerateNodeId(target);
	const targetNode = EXISTING_NODES.get(targetId);

	const afterNode = anchor ? getOrGenerateNodeId(anchor) : null;

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
			return;
		}

		// mount under current block
		targetId = containingBlockId;
	}

	postMessageBridge.send({
		type: PostMessageType.MOUNT_NODES,
		content: [{ parentId: targetId, afterNode, node: node }],
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

