/* eslint-disable @typescript-eslint/no-explicit-any */
import { SvelteAdapter } from '@pages/content/content-main/svelte/SvelteAdapter';
import {
	addSvelteListener,
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-expect-error
	removeListener,
} from '@pages/content/content-main/svelte/utils/addSvelteListener';
import { DataType } from '@src/shared/types/DataType';
import { SvelteBlockType } from '@src/shared/types/svelte-types';
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('SvelteAdapter', () => {
	const postMessageBridge = {
		send: vi.fn(),
		onMessage: vi.fn(),
	};
	let adapter: SvelteAdapter;

	beforeEach(() => {
		adapter = new SvelteAdapter(postMessageBridge as any);
		vi.clearAllMocks();
	});

	describe('injectListeners', () => {
		it('should add event listeners', () => {
			const eventListenersToAdd = [
				'SvelteRegisterComponent',
				'SvelteRegisterBlock',
				'SvelteDOMInsert',
				'SvelteDOMRemove',
				'SvelteDOMSetData',
			];
			adapter['injectListeners']();
			eventListenersToAdd.forEach((event) => {
				expect(addSvelteListener).toHaveBeenCalledWith(
					event,
					expect.any(Function)
				);
			});

			expect(addSvelteListener).toHaveBeenCalledTimes(
				eventListenersToAdd.length
			);
		});

		it('should return a function that removes all event listeners', () => {
			const removeListeners = adapter['injectListeners']();
			removeListeners();
			expect(removeListener).toHaveBeenCalledTimes(5);
		});
	});

	describe('inject', () => {
		// eslint-disable-next-line @typescript-eslint/ban-types
		let onDOMContentLoaded: Function;
		window.addEventListener = vi.fn((event, cb) => {
			if (event === 'DOMContentLoaded') {
				onDOMContentLoaded = cb;
			}
		}) as any;

		it('should inject listeners', () => {
			adapter['injectListeners'] = vi.fn(() => vi.fn());
			adapter['inject']();
			expect(adapter['injectListeners']).toHaveBeenCalled();
		});

		it('should not sendLibraryAttached if no svelte detected', () => {
			adapter['sendLibraryAttached'] = vi.fn();
			adapter['inject']();
			onDOMContentLoaded();
			expect(adapter['sendLibraryAttached']).not.toHaveBeenCalled();
		});

		it('should not sendLibraryAttached if Svelte version is less than 4', () => {
			adapter['sendLibraryAttached'] = vi.fn();
			window.__svelte = { v: new Set(['3']) };
			adapter['inject']();
			onDOMContentLoaded();
			expect(adapter['sendLibraryAttached']).not.toHaveBeenCalled();
		});

		it('should sendLibraryAttached if Svelte version is 4', () => {
			adapter['sendLibraryAttached'] = vi.fn();
			window.__svelte = { v: new Set(['4']) };
			adapter['inject']();
			onDOMContentLoaded();
			expect(adapter['sendLibraryAttached']).toHaveBeenCalled();
		});
	});

	describe('inspectElements', () => {
		it('should save ids to the set', () => {
			adapter['inspectElements'](['id1', 'id2']);
			expect(adapter['inspectedElementsIds']).toEqual(new Set(['id1', 'id2']));
		});

		it('should call handleNodeInspect for each id', () => {
			adapter['handleNodeInspect'] = vi.fn();
			adapter['inspectElements'](['id1', 'id2']);
			expect(adapter['handleNodeInspect']).toHaveBeenCalledTimes(2);
		});
	});

	describe('handleSvelteRegisterComponent', () => {
		it('should add captureState and propsKeys to componentsCaptureStates', () => {
			const detail = {
				component: {
					$capture_state: () => ({ state: 'state' }),
					$$: { props: { prop1: 'props', prop2: 'props' } },
				},
			};
			adapter['getElementId'] = vi.fn(() => 'sv0');
			adapter['handleSvelteRegisterComponent'](detail as any);
			expect(adapter['componentsCaptureStates'].get('sv0')).toEqual({
				captureState: expect.any(Function),
				propsKeys: ['prop1', 'prop2'],
			});
		});

		it('should call update if component is already mounted', () => {
			const detail = {
				component: {
					$capture_state: () => ({ state: 'state' }),
					$$: { props: { prop1: 'props', prop2: 'props' } },
				},
			};
			adapter['pendingComponents'].set('sv0', { name: 'Unknown' });
			adapter['getElementId'] = vi.fn(() => 'sv0');
			adapter['update'] = vi.fn();
			adapter['handleSvelteRegisterComponent'](detail as any);
			expect(adapter['update']).toHaveBeenCalled();
		});

		it('should add component to pendingComponents if it is not mounted', () => {
			const detail = {
				component: {
					$capture_state: () => ({ state: 'state' }),
					$$: { props: { prop1: 'props', prop2: 'props' } },
				},
				tagName: 'Component',
			};
			adapter['getElementId'] = vi.fn(() => 'sv0');
			adapter['handleSvelteRegisterComponent'](detail as any);
			expect(adapter['pendingComponents'].get('sv0')).toEqual({
				name: 'Component',
			});
		});
	});

	describe('handleNodeInspect', () => {
		it('should not call sendInspectedData if node is not in inspectedElementsIds', () => {
			adapter['sendInspectedData'] = vi.fn();
			adapter['handleNodeInspect']('sv0');
			expect(adapter['sendInspectedData']).not.toHaveBeenCalled();
		});

		it('should call sendInspectedData with correct data', () => {
			adapter['sendInspectedData'] = vi.fn();
			adapter['inspectedElementsIds'].add('sv0');
			adapter['existingNodes'].set('sv0', {
				name: 'Component',
				type: SvelteBlockType.component,
			} as any);
			adapter['componentsCaptureStates'].set('sv0', {
				captureState: () => ({ counter: 1, prop1: 'props', prop2: 'props' }),
				propsKeys: ['prop1', 'prop2'],
			});
			adapter['handleNodeInspect']('sv0');
			expect(adapter['sendInspectedData']).toHaveBeenCalledWith([
				{
					id: 'sv0',
					name: 'Component',
					library: 'Svelte',
					nodeInfo: [{ label: 'Type', value: SvelteBlockType.component }],
					nodeData: [
						{
							group: 'Props',
							data: [
								{
									label: 'prop1',
									value: { type: DataType.STRING, data: 'props' },
								},
								{
									label: 'prop2',
									value: { type: DataType.STRING, data: 'props' },
								},
							],
						},
						{
							group: 'State',
							data: [
								{ label: 'counter', value: { type: DataType.NUMBER, data: 1 } },
							],
						},
					],
				},
			]);
		});
	});

	describe('handleSvelteRegisterBlock', () => {
		it('should call hijacks', () => {
			adapter['hijackBlockMount'] = vi.fn();
			adapter['hijackBlockPatch'] = vi.fn();
			adapter['hijackBlockDestroy'] = vi.fn();
			adapter['handleSvelteRegisterBlock']({} as any);
			expect(adapter['hijackBlockMount']).toHaveBeenCalled();
			expect(adapter['hijackBlockPatch']).toHaveBeenCalled();
			expect(adapter['hijackBlockDestroy']).toHaveBeenCalled();
		});
	});

	describe('hijackBlockMount', () => {
		it('should call original', () => {
			const spy = vi.fn();
			const block = { m: spy };
			adapter['hijackBlockMount'](
				SvelteBlockType.component,
				block as any,
				'id'
			);
			block.m('target', 'anchor');
			expect(spy).toHaveBeenCalled();
		});

		it('should call mount', () => {
			const block = { m: vi.fn() };
			adapter['mount'] = vi.fn();
			adapter['hijackBlockMount'](
				SvelteBlockType.component,
				block as any,
				'id'
			);
			block.m('target', 'anchor');
			expect(adapter['mount']).toHaveBeenCalledWith(
				{
					type: SvelteBlockType.component,
					name: expect.any(String),
					children: [],
					id: '0',
				},
				'target',
				null,
				null,
				'anchor'
			);
		});

		it('should call mount for first each', () => {
			const block = { m: vi.fn() };
			adapter['mount'] = vi.fn();
			adapter['currentBlockId'] = 'currentBlockId';
			adapter['hijackBlockMount'](SvelteBlockType.each, block as any, 'id');
			block.m('target', 'anchor');
			expect(adapter['mount']).toHaveBeenCalledWith(
				{
					type: SvelteBlockType.each,
					name: expect.any(String),
					children: [],
					id: '0',
				},
				'target',
				'currentBlockId',
				null,
				'anchor'
			);
		});

		it('should not call mount for subsequent each', () => {
			const block = { m: vi.fn() };
			adapter['mount'] = vi.fn();
			adapter['currentBlockId'] = 'id';
			adapter['eaches'].set('id-id', { id: 'id', count: 1 });
			adapter['hijackBlockMount'](SvelteBlockType.each, block as any, 'id');
			block.m('target', 'anchor');
			expect(adapter['mount']).not.toHaveBeenCalled();
			expect(adapter['eaches'].get('id-id')).toEqual({ id: 'id', count: 2 });
		});

		it('should get component name from pendingComponents if it is not mounted', () => {
			const block = { m: vi.fn() };
			adapter['mount'] = vi.fn();
			adapter['pendingComponents'].set('0', { name: 'Component' });
			adapter['hijackBlockMount'](SvelteBlockType.component, block as any, '');
			block.m('target', 'anchor');
			expect(adapter['mount']).toHaveBeenCalledWith(
				{
					type: SvelteBlockType.component,
					name: 'Component',
					children: [],
					id: '0',
				},
				'target',
				null,
				null,
				'anchor'
			);
			expect(adapter['pendingComponents']).toEqual(new Map());
		});

		it('should set pendingComponents name to Unknown if it is not mounted', () => {
			const block = { m: vi.fn() };
			adapter['mount'] = vi.fn();
			adapter['hijackBlockMount'](
				SvelteBlockType.component,
				block as any,
				'id'
			);
			block.m('target', 'anchor');
			expect(adapter['pendingComponents'].get('0')).toEqual({
				name: 'Unknown',
			});
		});

		it('should set currentBlockId to blockId and revert it after mounting', () => {
			const block = {
				m: vi.fn((_target, _anchor) => {
					expect(adapter['currentBlockId']).toEqual('0');
				}),
			};
			adapter['hijackBlockMount'](
				SvelteBlockType.component,
				block as any,
				'id'
			);
			block.m('target', 'anchor');
			expect(adapter['currentBlockId']).toEqual(null);
		});
	});

	describe('hijackBlockPatch', () => {
		it('should call original', () => {
			const spy = vi.fn();
			const block = { p: spy };
			adapter['hijackBlockPatch'](SvelteBlockType.component, block as any);
			block.p('target', 'anchor');
			expect(spy).toHaveBeenCalled();
		});

		it('should call handleNodeInspect for component', () => {
			const block = { p: vi.fn() };
			adapter['handleNodeInspect'] = vi.fn();
			adapter['hijackBlockPatch'](SvelteBlockType.component, block as any);
			block.p('changed', 'ctx');
			expect(adapter['handleNodeInspect']).toHaveBeenCalled();
		});

		it('should set currentBlockId to blockId and revert it after patching', () => {
			const block = {
				p: vi.fn((_changed, _ctx) => {
					expect(adapter['currentBlockId']).toEqual('0');
				}),
			};
			adapter['hijackBlockPatch'](SvelteBlockType.component, block as any);
			block.p('changed', 'ctx');
			expect(adapter['currentBlockId']).toEqual(null);
		});
	});

	describe('hijackBlockDestroy', () => {
		it('should call original', () => {
			const spy = vi.fn();
			const block = { d: spy };
			adapter['hijackBlockDestroy'](
				SvelteBlockType.component,
				block as any,
				'id'
			);
			block.d(true);
			expect(spy).toHaveBeenCalled();
		});

		it('should call unmount for each if count is 0', () => {
			const block = { d: vi.fn() };
			adapter['unmount'] = vi.fn();
			adapter['currentBlockId'] = 'currentBlockId';
			adapter['eaches'].set('currentBlockId-id', { id: 'id', count: 1 });
			adapter['hijackBlockDestroy'](SvelteBlockType.each, block as any, 'id');
			block.d(true);
			expect(adapter['unmount']).toHaveBeenCalledWith('0');
			expect(adapter['eaches'].get('currentBlockId-id')).toBeUndefined();
		});

		it('should not call unmount for each if count is not 0', () => {
			const block = { d: vi.fn() };
			adapter['unmount'] = vi.fn();
			adapter['currentBlockId'] = 'currentBlockId';
			adapter['eaches'].set('currentBlockId-id', { id: 'id', count: 2 });
			adapter['hijackBlockDestroy'](SvelteBlockType.each, block as any, 'id');
			block.d(true);
			expect(adapter['unmount']).not.toHaveBeenCalled();
			expect(adapter['eaches'].get('currentBlockId-id')).toEqual({
				id: '0',
				count: 1,
			});
		});

		it('should call unmount for component', () => {
			const block = { d: vi.fn() };
			adapter['unmount'] = vi.fn();
			adapter['hijackBlockDestroy'](
				SvelteBlockType.component,
				block as any,
				'id'
			);
			block.d(true);
			expect(adapter['unmount']).toHaveBeenCalledWith('0');
		});
	});

	describe('handleSvelteDOMInsert', () => {
		it('should call mount', () => {
			adapter['mount'] = vi.fn();
			const node = document.createElement('div');
			adapter['handleSvelteDOMInsert']({
				target: 'target',
				node,
				anchor: 'anchor',
			} as any);

			expect(adapter['mount']).toHaveBeenCalledWith(
				{
					type: expect.any(String),
					name: expect.any(String),
					children: [],
					id: '0',
				},
				'target',
				null,
				node,
				'anchor'
			);
		});

		it('should call mount with correct children', () => {
			adapter['mount'] = vi.fn();
			const node = document.createElement('div');
			const child = document.createElement('div');
			node.appendChild(child);
			adapter['handleSvelteDOMInsert']({
				target: 'target',
				node,
				anchor: 'anchor',
			} as any);

			expect(adapter['mount']).toHaveBeenCalledWith(
				{
					type: SvelteBlockType.element,
					name: expect.any(String),
					children: [
						{
							id: '1',
							name: expect.any(String),
							type: SvelteBlockType.element,
							children: [],
						},
					],
					id: '0',
				},
				'target',
				null,
				node,
				'anchor'
			);
		});

		it('should add children to existingNodes', () => {
			adapter['mount'] = vi.fn();
			const node = document.createElement('div');
			const child = document.createElement('div');
			node.appendChild(child);
			adapter['handleSvelteDOMInsert']({
				target: 'target',
				node,
				anchor: 'anchor',
			} as any);

			expect(adapter['existingNodes'].get('1')).toEqual({
				containingBlockId: null,
				parentId: '0',
				name: expect.any(String),
				type: SvelteBlockType.element,
				node: child,
			});
		});
	});

	describe('handleSvelteDOMRemove', () => {
		it('should call unmount', () => {
			adapter['unmount'] = vi.fn();
			const node = document.createElement('div');
			adapter['handleSvelteDOMRemove']({ node });
			expect(adapter['unmount']).toHaveBeenCalledWith('0');
		});
	});

	describe('handleSvelteDOMSetData', () => {
		it('should call update with new data', () => {
			adapter['update'] = vi.fn();
			const node = document.createTextNode('oldData');
			adapter['handleSvelteDOMSetData']({ node, data: 'newData' });
			expect(adapter['update']).toHaveBeenCalledWith({
				id: '0',
				name: '"newData"',
			});
		});
	});

	describe('mount', () => {
		it('should sendMountRoots if containingBlockId is null', () => {
			adapter['sendMountRoots'] = vi.fn();
			adapter['mount'](
				{
					type: SvelteBlockType.component,
					name: 'Component',
					children: [],
					id: '0',
				},
				'target' as any,
				null,
				null,
				'anchor' as any
			);

			expect(adapter['sendMountRoots']).toHaveBeenCalledWith([
				{
					type: SvelteBlockType.component,
					name: 'Component',
					children: [],
					id: '0',
				},
			]);
		});

		it('should sendMountNodes with target as a parent if they are under the same block', () => {
			adapter['sendMountNodes'] = vi.fn();
			adapter['getElementId'] = vi.fn((element) => {
				if (element === 'target') {
					return 'targetId';
				}
			}) as any;
			adapter['existingNodes'].set('targetId', {
				containingBlockId: 'containingBlockId',
			} as any);
			adapter['mount'](
				{
					type: SvelteBlockType.component,
					name: 'Component',
					children: [],
					id: '0',
				},
				'target' as any,
				'containingBlockId',
				null
			);
			expect(adapter['sendMountNodes']).toHaveBeenCalledWith([
				{
					parentId: 'targetId',
					anchor: { type: 'before', id: null },
					node: {
						type: SvelteBlockType.component,
						name: 'Component',
						children: [],
						id: '0',
					},
				},
			]);
		});

		it('should sendMountNodes with containingBlockId as a parent if they are under different blocks', () => {
			adapter['sendMountNodes'] = vi.fn();
			adapter['getElementId'] = vi.fn((element) => {
				if (element === 'target') {
					return 'targetId';
				}
			}) as any;
			adapter['existingNodes'].set('targetId', {
				containingBlockId: 'differentBlockId',
			} as any);
			adapter['mount'](
				{
					type: SvelteBlockType.component,
					name: 'Component',
					children: [],
					id: '0',
				},
				'target' as any,
				'containingBlockId',
				null
			);
			expect(adapter['sendMountNodes']).toHaveBeenCalledWith([
				{
					parentId: 'containingBlockId',
					anchor: { type: 'before', id: null },
					node: {
						type: SvelteBlockType.component,
						name: 'Component',
						children: [],
						id: '0',
					},
				},
			]);
		});

		it('should set existingNodes', () => {
			adapter['sendMountNodes'] = vi.fn();
			const node = document.createElement('div');
			adapter['mount'](
				{
					type: SvelteBlockType.component,
					name: 'Component',
					children: [],
					id: '0',
				},
				'target' as any,
				'containingBlockId',
				node
			);
			expect(adapter['existingNodes'].get('0')).toEqual({
				parentId: 'containingBlockId',
				containingBlockId: 'containingBlockId',
				name: 'Component',
				type: SvelteBlockType.component,
				node,
			});
		});
	});

	describe('update', () => {
		it('should sendUpdateNodes with correct data', () => {
			adapter['sendUpdateNodes'] = vi.fn();
			adapter['update']({
				id: '0',
				name: 'Component',
			});
			expect(adapter['sendUpdateNodes']).toHaveBeenCalledWith([
				{
					id: '0',
					name: 'Component',
				},
			]);
		});

		it('should patch existingNodes and sendUpdateNodes with correct data', () => {
			adapter['sendUpdateNodes'] = vi.fn();
			const oldNode = {
				parentId: 'parentId',
				containingBlockId: 'containingBlockId',
				name: 'Component',
				type: SvelteBlockType.component,
				node: document.createElement('div'),
			};
			adapter['existingNodes'].set('0', oldNode);
			adapter['update']({
				id: '0',
				name: 'NewComponent',
			});
			expect(adapter['sendUpdateNodes']).toHaveBeenCalledWith([
				{
					id: '0',
					name: 'NewComponent',
				},
			]);
			expect(adapter['existingNodes'].get('0')).toEqual({
				...oldNode,
				name: 'NewComponent',
			});
		});
	});

	describe('unmount', () => {
		it('should sendUnmountNodes for root', () => {
			adapter['sendUnmountNodes'] = vi.fn();
			adapter['existingNodes'].set('0', {
				parentId: null,
				containingBlockId: 'containingBlockId',
				name: 'Component',
				type: SvelteBlockType.component,
				node: document.createElement('div'),
			});
			adapter['unmount']('0');
			expect(adapter['sendUnmountNodes']).toHaveBeenCalledWith({
				parentId: null,
				id: '0',
			});
		});

		it('should not sendUnmountNodes if cannot reach root node', () => {
			adapter['sendUnmountNodes'] = vi.fn();
			adapter['existingNodes'].set('0', {
				parentId: '1',
				containingBlockId: 'containingBlockId',
				name: 'Component',
				type: SvelteBlockType.component,
				node: document.createElement('div'),
			});
			adapter['unmount']('0');
			expect(adapter['sendUnmountNodes']).not.toHaveBeenCalled();
		});

		it('should sendUnmountNodes for child', () => {
			adapter['sendUnmountNodes'] = vi.fn();
			adapter['existingNodes'].set('0', {
				parentId: '1',
				containingBlockId: 'containingBlockId',
				name: 'Component',
				type: SvelteBlockType.component,
				node: document.createElement('div'),
			});
			adapter['existingNodes'].set('1', {
				parentId: null,
				containingBlockId: 'containingBlockId',
				name: 'Component',
				type: SvelteBlockType.component,
				node: document.createElement('div'),
			});
			adapter['unmount']('0');
			expect(adapter['sendUnmountNodes']).toHaveBeenCalledWith({
				parentId: '1',
				id: '0',
			});
			expect(adapter['existingNodes'].get('0')).toBeUndefined();
			expect(adapter['existingNodes'].get('1')).toBeDefined();
		});
	});
});

vi.mock(
	'@pages/content/content-main/svelte/utils/addSvelteListener',
	async () => {
		const removeListener = vi.fn();
		return {
			addSvelteListener: vi.fn(() => removeListener),
			removeListener,
		};
	}
);

