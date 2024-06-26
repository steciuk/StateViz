import { Adapter } from '@pages/content/content-main/Adapter';
import { dehydrate } from '@pages/content/content-main/dehydrate';
import {
	SvelteComponentFragment,
	SvelteDevToolsHook,
	SvelteEventMap,
} from '@pages/content/content-main/svelte/svelte-types';
import { addSvelteListener } from '@pages/content/content-main/svelte/utils/addSvelteListener';
import { getNodeTypeName } from '@pages/content/content-main/svelte/utils/getNodeTypeName';
import { getParsedNodeDisplayName } from '@pages/content/content-main/svelte/utils/getParsedNodeDisplayName';
import { PostMessageBridge } from '@pages/content/shared/PostMessageBridge';
import { InspectData } from '@src/shared/types/DataType';
import { Library } from '@src/shared/types/Library';
import { NodeId, ParsedSvelteNode } from '@src/shared/types/ParsedNode';
import { SvelteBlockType } from '@src/shared/types/svelte-types';
import {
	consoleError,
	consoleLog,
	consoleWarn,
} from '@src/shared/utils/console';

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

export class SvelteAdapter extends Adapter<ExistingNodeData, Library.SVELTE> {
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
	private inspectedElementsIds = new Set<NodeId>();

	private currentBlockId: NodeId | null = null;

	constructor(postMessageBridge: PostMessageBridge) {
		super(Library.SVELTE, postMessageBridge);
	}

	protected override inject() {
		// pre-inject in order not to miss any events
		const removeAllListeners = this.injectListeners();

		window.addEventListener('DOMContentLoaded', () => {
			// TODO: come up with a better solution for the timeout
			setTimeout(() => {
				const versions: number[] = [...(window.__svelte?.v ?? [])].map(
					(v) => +v
				);

				if (versions.length === 0) {
					consoleLog('No Svelte found');
					removeAllListeners();
					return;
				}

				if (!versions.some((v) => v >= SUPPORTED_SVELTE_MAJOR)) {
					consoleLog('No supported Svelte versions found');
					removeAllListeners();
					return;
				}

				// let the content-isolated know that the library is attached
				this.sendLibraryAttached();
				consoleLog('Svelte library attached');
			}, 1000);
		}),
			{ once: true };
	}

	protected override inspectElements(ids: NodeId[]) {
		this.inspectedElementsIds = new Set(ids);
		// if empty array it means that front stopped inspecting
		if (ids.length === 0) return;
		consoleLog('INSPECT_ELEMENT', ids);
		ids.forEach((id) => {
			this.handleNodeInspect(id);
		});
	}

	private injectListeners() {
		const listenerRemovers: (() => void)[] = [];

		listenerRemovers.push(
			addSvelteListener('SvelteRegisterComponent', ({ detail }) => {
				consoleLog('SvelteRegisterComponent', detail);
				this.handleSvelteRegisterComponent(detail);
			})
		);

		listenerRemovers.push(
			addSvelteListener('SvelteRegisterBlock', ({ detail }) => {
				consoleLog('SvelteRegisterBlock', detail);
				this.handleSvelteRegisterBlock(detail);
			})
		);

		listenerRemovers.push(
			addSvelteListener('SvelteDOMInsert', ({ detail }) => {
				consoleLog('SvelteDOMInsert', detail);
				this.handleSvelteDOMInsert(detail);
			})
		);

		listenerRemovers.push(
			addSvelteListener('SvelteDOMRemove', ({ detail }) => {
				consoleLog('SvelteDOMRemove', detail);
				this.handleSvelteDOMRemove(detail);
			})
		);

		// listenerRemovers.push(
		// 	addSvelteListener('SvelteDOMAddEventListener', (event) => {
		// 		consoleLog('SvelteDOMAddEventListener', event.detail);
		// 	})
		// );

		// listenerRemovers.push(
		// 	addSvelteListener('SvelteDOMRemoveEventListener', (event) => {
		// 		consoleLog('SvelteDOMRemoveEventListener', event.detail);
		// 	})
		// );

		listenerRemovers.push(
			addSvelteListener('SvelteDOMSetData', ({ detail }) => {
				consoleLog('SvelteDOMSetData', detail);
				this.handleSvelteDOMSetData(detail);
			})
		);

		// listenerRemovers.push(
		// 	addSvelteListener('SvelteDOMSetProperty', (event) => {
		// 		consoleLog('SvelteDOMSetProperty', event.detail);
		// 	})
		// );

		// listenerRemovers.push(
		// 	addSvelteListener('SvelteDOMSetAttribute', (event) => {
		// 		consoleLog('SvelteDOMSetAttribute', event.detail);
		// 	})
		// );

		// listenerRemovers.push(
		// 	addSvelteListener('SvelteDOMRemoveAttribute', (event) => {
		// 		consoleLog('SvelteDOMRemoveAttribute', event.detail);
		// 	})
		// );

		return () => {
			listenerRemovers.forEach((remover) => remover());
		};
	}

	private handleSvelteRegisterComponent(
		detail: SvelteEventMap['SvelteRegisterComponent']
	) {
		const { component, tagName } = detail;
		const id = this.getElementId(component.$$.fragment);

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
	// inspects the same node again and nothing has changed
	private handleNodeInspect(nodeId: NodeId) {
		if (!this.inspectedElementsIds.has(nodeId)) {
			return;
		}

		const nodeInfo = this.existingNodes.get(nodeId);
		if (!nodeInfo) {
			consoleError('Node not found', nodeId);
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

	private hijackBlockMount(
		type: SvelteBlockType,
		block: SvelteComponentFragment,
		svelteBlockId: string
	) {
		if (block.m) {
			const original = block.m;

			block.m = (target, anchor) => {
				let blockId = this.getElementId(block);
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
							break;

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
								parsedNode.name = 'Unknown';
								this.pendingComponents.set(blockId, { name: 'Unknown' });
							}
							break;
						}
					}

					// TODO: for each element in each block
					// there is a new each mounted
					// investigate that maybe and come up with a better solution
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
				} catch (err) {
					consoleError(err);
				} finally {
					// do not interrupt the mounting in case of an error
					original(target, anchor);
					// after mounting finished revert current block id
					this.currentBlockId = previousBlockId;
				}
			};
		}
	}

	private hijackBlockPatch(
		type: SvelteBlockType,
		block: SvelteComponentFragment
	) {
		if (block.p) {
			const original = block.p;

			block.p = (changed, ctx) => {
				// set last block id for successors
				const blockId = this.getElementId(block);

				this.handleNodeInspect(blockId);

				const previousBlockId = this.currentBlockId;
				this.currentBlockId = blockId;
				original(changed, ctx);
				// revert it back
				this.currentBlockId = previousBlockId;
			};
		}
	}

	private hijackBlockDestroy(
		type: SvelteBlockType,
		block: SvelteComponentFragment,
		svelteBlockId: string
	) {
		if (block.d) {
			const original = block.d;

			block.d = (detaching) => {
				const blockId = this.getElementId(block);

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
				} catch (err) {
					consoleError(err);
				} finally {
					original(detaching);
				}
			};
		}
	}

	private handleSvelteRegisterBlock(
		detail: SvelteEventMap['SvelteRegisterBlock']
	) {
		const { type, block, id: svelteBlockId } = detail;

		this.hijackBlockMount(type, block, svelteBlockId);
		this.hijackBlockPatch(type, block);
		this.hijackBlockDestroy(type, block, svelteBlockId);
	}

	private handleSvelteDOMInsert(detail: SvelteEventMap['SvelteDOMInsert']) {
		const { target, node, anchor } = detail;

		const parseNode = (
			node: Node,
			parentId: NodeId | null = null
		): ParsedSvelteNode => {
			const id = this.getElementId(node);
			const [type, name] = getNodeTypeName(node);

			const block: ParsedSvelteNode = {
				id,
				name,
				type,
				children: [...node.childNodes].map((child) => parseNode(child, id)),
			};

			// set only for children as they won't be set in mount
			if (parentId !== null) {
				this.existingNodes.set(id, {
					parentId,
					containingBlockId: this.currentBlockId,
					//
					name: block.name,
					type: block.type,
					node: node,
				});
			}

			return block;
		};

		const parsedNode = parseNode(node);
		if (this.existingNodes.has(parsedNode.id)) {
			this.update({ id: parsedNode.id, name: parsedNode.name });
			return;
		}
		this.mount(parsedNode, target, this.currentBlockId, node, anchor);
	}

	private handleSvelteDOMRemove(detail: SvelteEventMap['SvelteDOMRemove']) {
		const { node } = detail;
		const id = this.getElementId(node);
		this.unmount(id);
	}

	private handleSvelteDOMSetData(detail: SvelteEventMap['SvelteDOMSetData']) {
		const { node, data } = detail;
		const id = this.getElementId(node);

		// New value is in data, node has the old value
		const [type, oldName] = getNodeTypeName(node);

		// TODO: Can this be anything other than string?
		const name =
			typeof data === 'string'
				? getParsedNodeDisplayName({ type, name: data })
				: oldName;

		this.update({ id, name });
	}

	private mount(
		parsedNode: ParsedSvelteNode,
		target: Node,
		containingBlockId: NodeId | null,
		node: Node | null,
		anchor?: Node
	) {
		// TODO: check if change in this commit doesn't break anything
		if (containingBlockId === null) {
			// we are not processing any block, node has to be the root
			this.sendMountRoots([parsedNode]);

			this.existingNodes.set(parsedNode.id, {
				parentId: null,
				containingBlockId: null,
				name: parsedNode.name,
				type: parsedNode.type,
				node,
			});
			return;
		}

		let targetId = this.getElementId(target);
		const targetNode = this.existingNodes.get(targetId);

		if (
			// we have not inserted the target
			!targetNode ||
			// or current node has a different containing block than its target
			// i.e. there is a Svelte block between them
			containingBlockId !== targetNode.containingBlockId
		) {
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

		const anchorId = anchor ? this.getElementId(anchor) : null;
		// this.batchMountNodes(node, targetId, anchorId);
		this.sendMountNodes([
			{
				parentId: targetId,
				anchor: { type: 'before', id: anchorId },
				node: parsedNode,
			},
		]);
	}

	private update(node: { id: NodeId; name: string }) {
		const oldNode = this.existingNodes.get(node.id);
		if (oldNode) {
			this.existingNodes.set(node.id, {
				...oldNode,
				name: node.name,
			});
		}
		this.handleNodeInspect(node.id);
		this.sendUpdateNodes([node]);
	}

	private unmount(id: NodeId) {
		const nodeInfo = this.existingNodes.get(id);

		if (!nodeInfo) {
			return;
		}

		this.existingNodes.delete(id);
		this.componentsCaptureStates.delete(id);
		this.inspectedElementsIds.delete(id);

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

