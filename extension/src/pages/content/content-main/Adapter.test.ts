/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeEach, describe, expect, it, vi, afterEach } from 'vitest';
import { Adapter } from './Adapter';
import { Library } from '@src/shared/types/Library';
import {
	PostMessageBridge,
	PostMessageType,
} from '@pages/content/shared/PostMessageBridge';

class DummyAdapter extends Adapter<{ node: Node | null }, Library> {
	constructor(library: Library, postMessageBridge: PostMessageBridge) {
		super(library, postMessageBridge);
	}

	protected override inject = vi.fn();
	protected override inspectElements = vi.fn();
}

describe('Adapter', () => {
	const postMessageBridge = {
		send: vi.fn(),
		onMessage: vi.fn(),
	};
	let adapter: DummyAdapter;

	beforeEach(() => {
		adapter = new DummyAdapter(Library.SVELTE, postMessageBridge as any);
		vi.clearAllMocks();
	});

	afterEach(() => {
		Adapter['registeredLibraries'].clear();
		Adapter['registeredPrefixes'].clear();
		Adapter['overlay'] = undefined;
		Adapter['removeOverlayOnResizeUpdate'] = undefined;
	});

	describe('initialize', () => {
		it('should add library to registered libraries', () => {
			adapter.initialize();
			expect(Adapter['registeredLibraries'].has(Library.SVELTE)).toBe(true);
		});

		it('should throw error if library already registered', () => {
			const otherAdapter = new DummyAdapter(
				Library.SVELTE,
				postMessageBridge as any
			);
			otherAdapter.initialize();
			expect(() => adapter.initialize()).toThrowError(
				'Adapter for this library already registered'
			);
		});

		it('should add other library to registered libraries', () => {
			const otherAdapter = new DummyAdapter(
				Library.REACT,
				postMessageBridge as any
			);
			otherAdapter.initialize();
			adapter.initialize();
			expect(Adapter['registeredLibraries'].has(Library.REACT)).toBe(true);
			expect(Adapter['registeredLibraries'].has(Library.SVELTE)).toBe(true);
		});

		it('should set adapter prefix', () => {
			adapter.initialize();
			expect(adapter['adapterPrefix']).toBe('sv');
		});

		it('should set adapter prefix with count', () => {
			const otherAdapter = new DummyAdapter(
				'sveltify' as Library,
				postMessageBridge as any
			);
			otherAdapter.initialize();
			adapter.initialize();
			expect(adapter['adapterPrefix']).toBe('1sv');
		});

		it('should call postMessageBridge.onMessage', () => {
			adapter.initialize();
			expect(postMessageBridge.onMessage).toHaveBeenCalled();
			expect(postMessageBridge.onMessage).toBeCalledTimes(1);
		});

		it('should call inject', () => {
			adapter.initialize();
			expect(adapter['inject']).toHaveBeenCalled();
			expect(adapter['inject']).toBeCalledTimes(1);
		});
	});

	describe('sendLibraryAttached', () => {
		it('should call postMessageBridge.send with correct library', () => {
			adapter['sendLibraryAttached']();
			expect(postMessageBridge.send).toHaveBeenCalled();
			expect(postMessageBridge.send).toBeCalledTimes(1);
			expect(postMessageBridge.send).toBeCalledWith({
				type: PostMessageType.LIBRARY_ATTACHED,
				content: Library.SVELTE,
			});
		});
	});

	describe('sendMountRoots', () => {
		it('should call postMessageBridge.send with passed roots', () => {
			const roots = [{ prop: null }, { prop: null }];
			adapter['sendMountRoots'](roots as any);
			expect(postMessageBridge.send).toHaveBeenCalled();
			expect(postMessageBridge.send).toBeCalledTimes(1);
			expect(postMessageBridge.send).toBeCalledWith({
				type: PostMessageType.MOUNT_ROOTS,
				content: [
					{ node: { prop: null }, library: Library.SVELTE },
					{ node: { prop: null }, library: Library.SVELTE },
				],
			});
		});
	});

	describe('sendMountNodes', () => {
		it('should call postMessageBridge.send with passed operations', () => {
			const operations = [{ prop: null }, { prop: null }];
			adapter['sendMountNodes'](operations as any);
			expect(postMessageBridge.send).toHaveBeenCalled();
			expect(postMessageBridge.send).toBeCalledTimes(1);
			expect(postMessageBridge.send).toBeCalledWith({
				type: PostMessageType.MOUNT_NODES,
				content: operations,
			});
		});
	});

	describe('sendUpdateNodes', () => {
		it('should call postMessageBridge.send with passed operations', () => {
			const operations = [{ prop: null }, { prop: null }];
			adapter['sendUpdateNodes'](operations as any);
			expect(postMessageBridge.send).toHaveBeenCalled();
			expect(postMessageBridge.send).toBeCalledTimes(1);
			expect(postMessageBridge.send).toBeCalledWith({
				type: PostMessageType.UPDATE_NODES,
				content: operations,
			});
		});
	});

	describe('sendUnmountNodes', () => {
		it('should call postMessageBridge.send with passed operations', () => {
			const operations = { parentId: null, id: 1 };
			adapter['sendUnmountNodes'](operations as any);
			expect(postMessageBridge.send).toHaveBeenCalled();
			expect(postMessageBridge.send).toBeCalledTimes(1);
			expect(postMessageBridge.send).toBeCalledWith({
				type: PostMessageType.UNMOUNT_NODES,
				content: operations,
			});
		});
	});

	describe('sendInspectedData', () => {
		it('should call postMessageBridge.send with passed content', () => {
			const content = [{ prop: null }, { prop: null }];
			adapter['sendInspectedData'](content as any);
			expect(postMessageBridge.send).toHaveBeenCalled();
			expect(postMessageBridge.send).toBeCalledTimes(1);
			expect(postMessageBridge.send).toBeCalledWith({
				type: PostMessageType.INSPECTED_DATA,
				content,
			});
		});
	});

	describe('generateNewElementId', () => {
		beforeEach(() => {
			adapter['adapterPrefix'] = 'sv';
		});

		it('should return adapter prefix with 0 for the first node', () => {
			expect(adapter['generateNewElementId']()).toBe('sv0');
		});

		it('should return correct ids for subsequent nodes', () => {
			expect(adapter['generateNewElementId']()).toBe('sv0');
			expect(adapter['generateNewElementId']()).toBe('sv1');
			expect(adapter['generateNewElementId']()).toBe('sv2');
		});
	});

	describe('getElementId', () => {
		beforeEach(() => {
			adapter['adapterPrefix'] = 'sv';
		});

		it('should return new id for not seen elements', () => {
			const element = {};
			expect(adapter['getElementId'](element)).toBe('sv0');

			const otherElement = {};
			expect(adapter['getElementId'](otherElement)).toBe('sv1');
		});

		it('should return existing id for seen elements', () => {
			const element = {};
			expect(adapter['getElementId'](element)).toBe('sv0');
			expect(adapter['getElementId'](element)).toBe('sv0');
		});
	});

	describe('handleInspectElementPostMessage', () => {
		it('should call inspectElements with existing ids', () => {
			adapter['existingNodes'].set('1', { node: { prop: null } } as any);
			adapter['existingNodes'].set('2', { node: { prop: null } } as any);
			adapter['handleInspectElementPostMessage']({
				content: ['1', '2'],
			} as any);
			expect(adapter['inspectElements']).toHaveBeenCalled();
			expect(adapter['inspectElements']).toBeCalledTimes(1);
			expect(adapter['inspectElements']).toBeCalledWith(['1', '2']);
		});

		it('should filter out not existing ids for inspectElements call', () => {
			adapter['existingNodes'].set('1', { node: { prop: null } } as any);
			adapter['existingNodes'].set('2', { node: { prop: null } } as any);
			adapter['handleInspectElementPostMessage']({
				content: ['1', '2', '3'],
			} as any);
			expect(adapter['inspectElements']).toHaveBeenCalledWith(['1', '2']);
		});
	});

	describe('handleHoverPostMessage', () => {
		it('should do nothing if node not found', () => {
			adapter['existingNodes'].set('1', { node: null } as any);
			adapter['handleHoverPostMessage']({ content: '1' } as any);
			expect(Adapter['overlay']).toBeUndefined();
			expect(Adapter['removeOverlayOnResizeUpdate']).toBeUndefined();
		});

		it('should do nothing if element not found', () => {
			adapter['existingNodes'].set('1', { node: { prop: null } } as any);
			adapter['handleHoverPostMessage']({ content: '1' } as any);
			expect(Adapter['overlay']).toBeUndefined();
			expect(Adapter['removeOverlayOnResizeUpdate']).toBeUndefined();
		});

		it('should call setOverlay initially and on every resize', () => {
			adapter['setOverlay'] = vi.fn();

			adapter['existingNodes'].set('1', {
				node: document.createElement('div'),
			} as any);
			adapter['handleHoverPostMessage']({ content: '1' } as any);
			expect(adapter['setOverlay']).toHaveBeenCalledTimes(1);
			expect(Adapter['removeOverlayOnResizeUpdate']).toBeDefined();

			window.dispatchEvent(new Event('resize'));
			expect(adapter['setOverlay']).toHaveBeenCalledTimes(2);
		});
	});

	describe('setOverlay', () => {
		it('should set overlay element', () => {
			const element = document.createElement('div');
			adapter['setOverlay'](element);
			expect(Adapter['overlay']).toBeDefined();
		});
	});
});

