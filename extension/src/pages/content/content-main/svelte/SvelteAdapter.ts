import { Adapter } from '@pages/content/content-main/Adapter';
import { dehydrate } from '@pages/content/content-main/dehydrate';
import {
	SvelteDevToolsHook,
	SvelteEventMap,
} from '@pages/content/content-main/svelte/svelte-types';
import { getNodeTypeName } from '@pages/content/content-main/svelte/utils/getNodeTypeName';
import { getParsedNodeDisplayName } from '@pages/content/content-main/svelte/utils/getParsedNodeDisplayName';
import {
	PostMessage,
	PostMessageType,
} from '@pages/content/shared/PostMessageBridge';
import { InspectData } from '@src/shared/types/DataType';
import { Library } from '@src/shared/types/Library';
import { NodeId, ParsedSvelteNode } from '@src/shared/types/ParsedNode';
import { SvelteBlockType } from '@src/shared/types/svelte-types';

declare global {
	interface Window {
		__svelte?: SvelteDevToolsHook;
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

type ExistingNodeData = {
	parentId: NodeId | null;
	containingBlockId: NodeId | null;
	name: string;
	type: SvelteBlockType;
	node: Node | null;
};

export class SvelteAdapter extends Adapter<ExistingNodeData> {
	protected override readonly adapterPrefix = 'sv';

	private readonly pendingComponents = new Map<NodeId, { name: string }>();
	// parentId + svelteBlockId
	private readonly eaches = new Map<
		`${NodeId}-${string}`,
		{ id: NodeId; count: number }
	>();

	private readonly componentsCaptureStates = new Map<
		NodeId,
		{
			captureState: () => unknown;
			propsKeys: string[];
		}
	>();
	private inspectedComponentsIds = new Set<NodeId>();

	private currentBlockId: NodeId | null = null;

	protected override inject() {
		// pre-inject in order not to miss any events
		const removeAllListeners = this.injectListeners();

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
			this.sendLibraryAttached();
		});
	}

	protected override handlePostMessageBridgeMessage(message: PostMessage) {
		// Request to inspect nodes
		if (message.type === PostMessageType.INSPECT_ELEMENT) {
			// filter out not existing or other library elements
			const ownInspectedElementsIds = message.content.filter((id) =>
				this.existingNodes.has(id)
			);

			this.inspectedComponentsIds = new Set(ownInspectedElementsIds);
			// if empty array it means that front stopped inspecting
			if (ownInspectedElementsIds.length === 0) return;

			console.log('INSPECT_ELEMENT', ownInspectedElementsIds);

			ownInspectedElementsIds.forEach((id) => {
				this.handleNodeInspect(id);
			});
		}
	}

	private injectListeners() {
		const listenerRemovers: (() => void)[] = [];

		listenerRemovers.push(
			this.addSvelteListener('SvelteRegisterComponent', ({ detail }) => {
				console.log('SvelteRegisterComponent', detail);
				this.handleSvelteRegisterComponent(detail);
			})
		);

		listenerRemovers.push(
			this.addSvelteListener('SvelteRegisterBlock', ({ detail }) => {
				console.log('SvelteRegisterBlock', detail);
				this.handleSvelteRegisterBlock(detail);
			})
		);

		listenerRemovers.push(
			this.addSvelteListener('SvelteDOMInsert', ({ detail }) => {
				console.log('SvelteDOMInsert', detail);
				this.handleSvelteDOMInsert(detail);
			})
		);

		listenerRemovers.push(
			this.addSvelteListener('SvelteDOMRemove', ({ detail }) => {
				console.log('SvelteDOMRemove', detail);
				this.handleSvelteDOMRemove(detail);
			})
		);

		// listenerRemovers.push(
		// 	this.addSvelteListener('SvelteDOMAddEventListener', (event) => {
		// 		console.log('SvelteDOMAddEventListener', event.detail);
		// 	})
		// );

		// listenerRemovers.push(
		// 	this.addSvelteListener('SvelteDOMRemoveEventListener', (event) => {
		// 		console.log('SvelteDOMRemoveEventListener', event.detail);
		// 	})
		// );

		// listenerRemovers.push(
		// 	this.addSvelteListener('SvelteDOMSetData', (event) => {
		// 		console.log('SvelteDOMSetData', event.detail);
		// 	})
		// );

		// listenerRemovers.push(
		// 	this.addSvelteListener('SvelteDOMSetProperty', (event) => {
		// 		console.log('SvelteDOMSetProperty', event.detail);
		// 	})
		// );

		// listenerRemovers.push(
		// 	this.addSvelteListener('SvelteDOMSetAttribute', (event) => {
		// 		console.log('SvelteDOMSetAttribute', event.detail);
		// 	})
		// );

		// listenerRemovers.push(
		// 	this.addSvelteListener('SvelteDOMRemoveAttribute', (event) => {
		// 		console.log('SvelteDOMRemoveAttribute', event.detail);
		// 	})
		// );

		return () => {
			listenerRemovers.forEach((remover) => remover());
			console.warn('All Svelte listeners removed');
		};
	}

	private addSvelteListener<K extends keyof SvelteEventMap>(
		type: K,
		listener: (event: CustomEvent<SvelteEventMap[K]>) => void
	) {
		window.addEventListener(type, listener);
		return () => window.removeEventListener(type, listener);
	}

	private handleSvelteRegisterComponent(
		detail: SvelteEventMap['SvelteRegisterComponent']
	) {
		const { component, tagName } = detail;
		const id = this.getOrGenerateElementId(component.$$.fragment);

		this.componentsCaptureStates.set(id, {
			captureState: component.$capture_state,
			propsKeys: Object.keys(component.$$.props),
		});

		if (this.pendingComponents.has(id)) {
			// root component is mounted before it's registered
			this.update({ id, name: tagName });
			this.pendingComponents.delete(id);
			return;
		}

		this.pendingComponents.set(id, { name: tagName });
	}

	// TODO: cache node data similar to React Adapter so
	// we don't have to traverse and dehydrate data if user
	// inspects the same node again and nothing changed
	private handleNodeInspect(nodeId: NodeId) {
		if (!this.inspectedComponentsIds.has(nodeId)) {
			return;
		}

		const nodeInfo = this.existingNodes.get(nodeId);
		if (!nodeInfo) {
			console.error('node not found', nodeId);
			return;
		}

		const state: { label: string; value: InspectData }[] = [];
		const props: { label: string; value: InspectData }[] = [];

		const componentCaptureState = this.componentsCaptureStates.get(nodeId);
		if (componentCaptureState) {
			const { captureState, propsKeys } = componentCaptureState;
			const capturedState = captureState();

			if (capturedState && typeof capturedState === 'object') {
				Object.entries(capturedState).forEach(([key, value]) => {
					if (propsKeys.includes(key)) {
						props.push({ label: key, value: dehydrate(value) });
					} else {
						state.push({ label: key, value: dehydrate(value) });
					}
				});
			}
		}

		this.sendInspectedData([
			{
				id: nodeId,
				name: nodeInfo.name,
				library: Library.SVELTE,
				nodeInfo: [{ label: 'Type', value: nodeInfo.type }],
				nodeData: [
					{
						group: 'Props',
						data: props,
					},
					{
						group: 'State',
						data: state,
					},
				],
			},
		]);
	}

	private handleSvelteRegisterBlock(
		detail: SvelteEventMap['SvelteRegisterBlock']
	) {
		const { type, block, id: svelteBlockId } = detail;

		if (block.m) {
			const original = block.m;

			block.m = (target, anchor) => {
				let blockId = this.getOrGenerateElementId(block);
				const parsedNode: ParsedSvelteNode = {
					type,
					name: getParsedNodeDisplayName({ type, name: type }),
					children: [],
					id: blockId,
				};
				const previousBlockId = this.currentBlockId;

				try {
					switch (type) {
						case SvelteBlockType.then:
						case SvelteBlockType.catch:
							// TODO: implement
							throw new Error('then/catch not implemented');

						case SvelteBlockType.component: {
							const component = this.pendingComponents.get(blockId);
							if (component) {
								parsedNode.name = getParsedNodeDisplayName({
									type,
									name: component.name,
								});
								this.pendingComponents.delete(blockId);
							} else {
								// root component is mounted before it's registered
								parsedNode.name = getParsedNodeDisplayName({
									type,
									name: 'Unknown',
								});
								this.pendingComponents.set(blockId, { name: 'Unknown' });
							}

							this.handleNodeInspect(blockId);

							break;
						}
					}

					// TODO: for each element in each block
					// there is a new each mounted
					// investigate that and come up with a better solution
					// TODO: check if it works for more than one each in one block
					if (type === SvelteBlockType.each) {
						if (!this.currentBlockId) {
							throw new Error('each outside of block');
						}

						let each = this.eaches.get(
							`${this.currentBlockId}-${svelteBlockId}`
						);
						if (!each) {
							// if there was no each, mount it
							each = { id: blockId, count: 0 };
							this.mount(parsedNode, target, this.currentBlockId, null, anchor);
						}

						this.eaches.set(`${this.currentBlockId}-${svelteBlockId}`, {
							id: each.id,
							count: each.count + 1,
						});
						// if there was an each, overwrite id for successors
						// so they are mounted under old each
						blockId = each.id;
					} else {
						// always mount other blocks
						this.mount(parsedNode, target, this.currentBlockId, null, anchor);
					}

					// set current block id for successors
					this.currentBlockId = blockId;
				} finally {
					// do not interrupt the mounting in case of an error
					original(target, anchor);
					// after mounting finished revert current block id
					this.currentBlockId = previousBlockId;
				}
			};
		}

		if (block.p) {
			const original = block.p;

			block.p = (changed, ctx) => {
				// set last block id for successors
				const blockId = this.getOrGenerateElementId(block);

				if (type === SvelteBlockType.component) {
					this.handleNodeInspect(blockId);
				}

				const previousBlockId = this.currentBlockId;
				this.currentBlockId = blockId;
				original(changed, ctx);
				// revert it back
				this.currentBlockId = previousBlockId;
			};
		}

		if (block.d) {
			const original = block.d;

			block.d = (detaching) => {
				const blockId = this.getOrGenerateElementId(block);

				try {
					if (type === SvelteBlockType.each) {
						if (!this.currentBlockId) {
							throw new Error('each outside of block');
						}

						// decrement the each counter
						// and unmount it if there are no blocks mounted underneath
						let counter =
							this.eaches.get(`${this.currentBlockId}-${svelteBlockId}`)
								?.count ?? 0;
						counter -= 1;
						if (counter <= 0) {
							this.eaches.delete(`${this.currentBlockId}-${svelteBlockId}`);
							this.unmount(blockId);
						} else {
							this.eaches.set(`${this.currentBlockId}-${svelteBlockId}`, {
								id: blockId,
								count: counter,
							});
						}
					} else {
						this.unmount(blockId);
					}
				} finally {
					original(detaching);
				}
			};
		}
	}

	private handleSvelteDOMInsert(detail: SvelteEventMap['SvelteDOMInsert']) {
		const { target, node, anchor } = detail;

		const parseNode = (node: Node, root: boolean): ParsedSvelteNode => {
			const id = this.getOrGenerateElementId(node);
			const [type, name] = getNodeTypeName(node);

			const block: ParsedSvelteNode = {
				id,
				name,
				type,
				children: [...node.childNodes].map((child) => parseNode(child, false)),
			};

			// set only for children as they won't be set in mount
			if (!root) {
				this.existingNodes.set(id, {
					// parentId and containingBlockId are not important for children
					// there wont be any mounts under them
					parentId: null,
					containingBlockId: null,
					//
					name: block.name,
					type: block.type,
					node: node,
				});
			}

			return block;
		};

		const parsedNode = parseNode(node, true);
		const element = node;
		this.mount(parsedNode, target, this.currentBlockId, element, anchor);
	}

	private handleSvelteDOMRemove(detail: SvelteEventMap['SvelteDOMRemove']) {
		const { node } = detail;
		const id = this.getOrGenerateElementId(node);
		this.unmount(id);
	}

	private mount(
		parsedNode: ParsedSvelteNode,
		target: Node,
		containingBlockId: NodeId | null,
		node: Node | null,
		anchor?: Node
	) {
		let targetId = this.getOrGenerateElementId(target);
		const targetNode = this.existingNodes.get(targetId);

		if (
			// we have not inserted the target
			!targetNode ||
			// or current node has a different containing block than its target
			// i.e. there is a Svelte block between them
			containingBlockId !== targetNode.containingBlockId
		) {
			if (containingBlockId === null) {
				// we are not processing any block, node has to be the root
				this.sendMountRoots([{ node: parsedNode, library: Library.SVELTE }]);

				this.existingNodes.set(parsedNode.id, {
					parentId: null,
					containingBlockId: null,
					name: parsedNode.name,
					type: parsedNode.type,
					node,
				});
				return;
			}

			// mount under current block
			targetId = containingBlockId;
		}

		this.existingNodes.set(parsedNode.id, {
			parentId: targetId,
			containingBlockId: containingBlockId,
			name: parsedNode.name,
			type: parsedNode.type,
			node: node,
		});

		const anchorId = anchor ? this.getOrGenerateElementId(anchor) : null;
		// this.batchMountNodes(node, targetId, anchorId);
		this.sendMountNodes([
			{
				parentId: targetId,
				anchor: { type: 'before', id: anchorId },
				node: parsedNode,
			},
		]);
	}

	private debounceTime = 100;
	private debouncer: NodeJS.Timeout | null = null;
	private pendingMounts = new Map<
		NodeId,
		{
			parentId: NodeId;
			anchor: NodeId | null;
			node: ParsedSvelteNode;
		}
	>();

	private batchMountNodes(
		node: ParsedSvelteNode,
		parentId: NodeId,
		beforeNode: NodeId | null
	) {
		if (this.debouncer) {
			clearTimeout(this.debouncer);
		}

		const pendingParent = this.pendingMounts.get(parentId);
		if (pendingParent) {
			if (beforeNode === null) {
				pendingParent.node.children.push(node);
			} else {
				const index = pendingParent.node.children.findIndex(
					(child) => child.id === beforeNode
				);
				if (index === -1) {
					console.error('anchorNode not found');
					return;
				} else {
					pendingParent.node.children.splice(index, 0, node);
				}
			}
		} else {
			this.pendingMounts.set(node.id, {
				parentId,
				anchor: beforeNode,
				node,
			});
		}

		this.debouncer = setTimeout(() => {
			this.sendMountNodes(
				Array.from(this.pendingMounts.values()).map((mount) => ({
					parentId: mount.parentId,
					anchor: { type: 'before', id: mount.anchor },
					node: mount.node,
				}))
			);
			this.pendingMounts.clear();
			this.debouncer = null;
		}, this.debounceTime);
	}

	private update(node: { id: NodeId; name: string }) {
		this.sendUpdateNodes([node]);
	}

	private unmount(id: NodeId) {
		const nodeInfo = this.existingNodes.get(id);

		if (!nodeInfo) {
			console.error('node not found', id);
			return;
		}

		this.existingNodes.delete(id);
		this.componentsCaptureStates.delete(id);
		this.inspectedComponentsIds.delete(id);

		let sendUpdates = true;
		let parentId = nodeInfo.parentId;

		while (parentId !== null) {
			const parent = this.existingNodes.get(parentId);

			if (parent === undefined) {
				sendUpdates = false;
				break;
			}

			parentId = parent.parentId;
		}

		if (sendUpdates) {
			this.sendUnmountNodes({
				parentId: nodeInfo.parentId,
				id,
			});
		}
	}
}

