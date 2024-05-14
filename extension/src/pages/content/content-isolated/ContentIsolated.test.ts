/* eslint-disable @typescript-eslint/no-explicit-any */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ContentIsolated } from '@pages/content/content-isolated/ContentIsolated';
import {
	MountNodesOperations,
	PostMessageBridge,
	PostMessageSource,
	PostMessageType,
} from '@pages/content/shared/PostMessageBridge';
import {
	ChromeMessageSource,
	ChromeMessageType,
	onChromeMessage,
	sendChromeMessage,
} from '@src/shared/chrome/chrome-message';
import {
	ChromeBridgeConnection,
	ChromeBridgeListener,
	ChromeBridgeMessageType,
} from '@src/shared/chrome/ChromeBridge';
import {
	NodeAndLibrary,
	ParsedNode,
	ParsedReactNode,
	ParsedSvelteNode,
} from '@src/shared/types/ParsedNode';
import { Library } from '@src/shared/types/Library';
import { Mock } from 'node:test';

describe(ContentIsolated.name, () => {
	let contentIsolated: ContentIsolated;

	let postMessageBridge: PostMessageBridge;
	const chromeBridgeConstructor: Mock<any> = ChromeBridgeListener;
	let chromeBridge: ChromeBridgeListener;

	beforeEach(() => {
		PostMessageBridge['instance'] = undefined;
		postMessageBridge = PostMessageBridge.getInstance(
			PostMessageSource.ISOLATED
		);
		chromeBridge = new ChromeBridgeListener(
			ChromeBridgeConnection.PANEL_TO_CONTENT,
			() => {}
		);

		chromeBridgeConstructor.mockClear();
		contentIsolated = ContentIsolated.initialize();
	});

	afterEach(() => {
		ContentIsolated['instance'] = undefined;
		vi.clearAllMocks();
	});

	describe(ContentIsolated.initialize.name, () => {
		it('should call ChromeBridgeListener constructor', () => {
			expect(chromeBridgeConstructor).toBeCalledTimes(1);
			expect(chromeBridgeConstructor).toBeCalledWith(
				ChromeBridgeConnection.PANEL_TO_CONTENT,
				expect.any(Function)
			);
		});

		it('should throw an error if ContentIsolated is already initialized', () => {
			expect(() => ContentIsolated.initialize()).toThrowError(
				'ContentIsolated already initialized'
			);
		});
	});

	describe('handleDevtoolsPanelConnection', () => {
		it('should send FULL_SKELETON message', () => {
			const roots: NodeAndLibrary[] = [
				{ library: Library.REACT, node: { name: '1' } as ParsedReactNode },
				{ library: Library.SVELTE, node: { name: '2' } as ParsedSvelteNode },
			];
			contentIsolated['roots'] = roots;
			contentIsolated['handleDevtoolsPanelConnection']();

			expect(chromeBridge.send).toBeCalledWith({
				type: ChromeBridgeMessageType.FULL_SKELETON,
				content: roots,
			});
		});
	});

	describe('setupListeners', () => {
		it('should setup postMessageBridge listener', () => {
			expect(postMessageBridge.onMessage).toBeCalledTimes(1);
		});

		it('should setup chromeBridge listener', () => {
			expect(chromeBridge.onMessage).toBeCalledTimes(1);
		});

		it('should setup onChromeMessage listener', () => {
			expect(onChromeMessage).toBeCalledTimes(1);
		});
	});

	describe('handleLibraryAttachedPostMessage', () => {
		const libraryAttachedPostMessage = {
			content: Library.REACT,
			source: PostMessageSource.MAIN,
			type: PostMessageType.LIBRARY_ATTACHED,
		} as const;

		it('should register the library', () => {
			contentIsolated['handleLibraryAttachedPostMessage'](
				libraryAttachedPostMessage
			);

			expect(contentIsolated['librariesAttached']).toContain(Library.REACT);
		});

		it('should send LIBRARY_ATTACHED message', () => {
			contentIsolated['handleLibraryAttachedPostMessage'](
				libraryAttachedPostMessage
			);

			expect(sendChromeMessage).toBeCalledTimes(1);
			expect(sendChromeMessage).toBeCalledWith({
				type: ChromeMessageType.LIBRARY_ATTACHED,
				source: ChromeMessageSource.CONTENT_SCRIPT,
				content: Library.REACT,
			});
		});
	});

	describe('addNodesRecursively', () => {
		it('should add nodes to currentNodes', () => {
			const nodes = [
				{
					id: 're1',
					name: '1',
					children: [
						{ id: 're2', name: '2', children: [] },
						{ id: 're3', name: '3', children: [] },
					],
				},
				{ id: 're4', name: '4', children: [] },
			] as unknown as ParsedNode[];

			contentIsolated['addNodesRecursively'](nodes);

			expect(contentIsolated['nodes'].size).toBe(4);
			expect(contentIsolated['nodes']).toEqual(
				new Map([
					['re1', nodes[0]],
					['re2', nodes[0].children[0]],
					['re3', nodes[0].children[1]],
					['re4', nodes[1]],
				])
			);
		});
	});

	describe('handleMountRootsPostMessage', () => {
		it('should add roots to currentNodes and send FULL_SKELETON message', () => {
			const message = {
				content: [
					{
						library: Library.REACT,
						node: { id: 're1', name: '1', children: [] },
					},
					{
						library: Library.SVELTE,
						node: { id: 'sv1', name: '2', children: [] },
					},
				],
			};

			contentIsolated['handleMountRootsPostMessage'](message as any);

			expect(contentIsolated['nodes'].size).toBe(2);
			expect(contentIsolated['nodes'].get('re1')).toBe(message.content[0].node);
			expect(contentIsolated['nodes'].get('sv1')).toBe(message.content[1].node);
			expect(chromeBridge.send).toBeCalledWith({
				type: ChromeBridgeMessageType.FULL_SKELETON,
				content: message.content,
			});
		});

		it('should not add roots if they are already mounted', () => {
			const message = {
				content: [
					{
						library: Library.REACT,
						node: { id: 're1', name: '1', children: [] },
					},
				],
			};

			contentIsolated['nodes'].set('re1', message.content[0].node as any);

			contentIsolated['handleMountRootsPostMessage'](message as any);

			expect(contentIsolated['nodes'].size).toBe(1);
			expect(chromeBridge.send).toBeCalledWith({
				type: ChromeBridgeMessageType.FULL_SKELETON,
				content: message.content,
			});
		});
	});

	describe('handleMountNodesPostMessage', () => {
		it('should not add nodes to currentNodes if parent was not found', () => {
			const message = {
				content: [
					{
						parentId: 're1',
						node: { id: 're2', children: [] } as unknown as ParsedNode,
						anchor: { type: 'before', id: null },
					},
				] as MountNodesOperations<Library>,
			};

			contentIsolated['handleMountNodesPostMessage'](message as any);

			expect(contentIsolated['nodes'].size).toBe(0);
			expect(chromeBridge.send).not.toBeCalled();
		});

		it('should properly add nodes at the end of children array', () => {
			const rootsMessage = {
				content: [
					{
						library: Library.SVELTE,
						node: {
							id: 'sv1',
							children: [
								{
									id: 'sv2',
									children: [],
								},
							],
						} as unknown as ParsedSvelteNode,
					},
				],
			};

			const message = {
				content: [
					{
						parentId: 'sv1',
						node: { id: 'sv3', children: [] } as unknown as ParsedSvelteNode,
						anchor: { type: 'before', id: null },
					},
				] as MountNodesOperations<Library.SVELTE>,
			};

			contentIsolated['handleMountRootsPostMessage'](rootsMessage as any);
			contentIsolated['handleMountNodesPostMessage'](message as any);

			expect(contentIsolated['nodes'].get('sv3')).toBe(message.content[0].node);
			expect(contentIsolated['roots'][0].node.children).toEqual([
				{ id: 'sv2', children: [] },
				message.content[0].node,
			]);

			expect(chromeBridge.send).toBeCalledWith({
				type: ChromeBridgeMessageType.FULL_SKELETON,
				content: rootsMessage.content,
			});
		});

		it('should properly add nodes at the beginning of children array', () => {
			const rootsMessage = {
				content: [
					{
						library: Library.SVELTE,
						node: {
							id: 'sv1',
							children: [
								{
									id: 'sv2',
									children: [],
								},
							],
						} as unknown as ParsedSvelteNode,
					},
				],
			};

			const message = {
				content: [
					{
						parentId: 'sv1',
						node: { id: 'sv3', children: [] } as unknown as ParsedSvelteNode,
						anchor: { type: 'after', id: null },
					},
				] as MountNodesOperations<Library.SVELTE>,
			};

			contentIsolated['handleMountRootsPostMessage'](rootsMessage as any);
			contentIsolated['handleMountNodesPostMessage'](message as any);

			expect(contentIsolated['nodes'].get('sv3')).toBe(message.content[0].node);
			expect(contentIsolated['roots'][0].node.children).toEqual([
				message.content[0].node,
				{ id: 'sv2', children: [] },
			]);

			expect(chromeBridge.send).toBeCalledWith({
				type: ChromeBridgeMessageType.FULL_SKELETON,
				content: rootsMessage.content,
			});
		});

		it('should properly add nodes after the anchor node', () => {
			const rootsMessage = {
				content: [
					{
						library: Library.SVELTE,
						node: {
							id: 'sv1',
							children: [
								{
									id: 'sv2',
									children: [],
								},
								{
									id: 'sv4',
									children: [],
								},
							],
						} as unknown as ParsedSvelteNode,
					},
				],
			};

			const message = {
				content: [
					{
						parentId: 'sv1',
						node: { id: 'sv3', children: [] } as unknown as ParsedSvelteNode,
						anchor: { type: 'after', id: 'sv2' },
					},
				] as MountNodesOperations<Library.SVELTE>,
			};

			contentIsolated['handleMountRootsPostMessage'](rootsMessage as any);
			contentIsolated['handleMountNodesPostMessage'](message as any);

			expect(contentIsolated['nodes'].get('sv3')).toBe(message.content[0].node);
			expect(contentIsolated['roots'][0].node.children).toEqual([
				{ id: 'sv2', children: [] },
				message.content[0].node,
				{ id: 'sv4', children: [] },
			]);

			expect(chromeBridge.send).toBeCalledWith({
				type: ChromeBridgeMessageType.FULL_SKELETON,
				content: rootsMessage.content,
			});
		});

		it('should properly add nodes before the anchor node', () => {
			const rootsMessage = {
				content: [
					{
						library: Library.SVELTE,
						node: {
							id: 'sv1',
							children: [
								{
									id: 'sv2',
									children: [],
								},
								{
									id: 'sv4',
									children: [],
								},
							],
						} as unknown as ParsedSvelteNode,
					},
				],
			};

			const message = {
				content: [
					{
						parentId: 'sv1',
						node: { id: 'sv3', children: [] } as unknown as ParsedSvelteNode,
						anchor: { type: 'before', id: 'sv4' },
					},
				] as MountNodesOperations<Library.SVELTE>,
			};

			contentIsolated['handleMountRootsPostMessage'](rootsMessage as any);
			contentIsolated['handleMountNodesPostMessage'](message as any);

			expect(contentIsolated['nodes'].get('sv3')).toBe(message.content[0].node);
			expect(contentIsolated['roots'][0].node.children).toEqual([
				{ id: 'sv2', children: [] },
				message.content[0].node,
				{ id: 'sv4', children: [] },
			]);

			expect(chromeBridge.send).toBeCalledWith({
				type: ChromeBridgeMessageType.FULL_SKELETON,
				content: rootsMessage.content,
			});
		});
	});

	describe('handleNodeUpdatePostMessage', () => {
		it('should update node and send FULL_SKELETON message', () => {
			const rootsMessage = {
				content: [
					{
						library: Library.SVELTE,
						node: {
							id: 'sv1',
							children: [
								{
									id: 'sv2',
									children: [],
								},
							],
						} as unknown as ParsedSvelteNode,
					},
				],
			};

			const message = {
				content: [
					{
						id: 'sv2',
						name: 'new name',
					},
				],
			};

			contentIsolated['handleMountRootsPostMessage'](rootsMessage as any);
			contentIsolated['handleNodeUpdatePostMessage'](message as any);

			expect(contentIsolated['nodes'].get('sv2')?.name).toBe('new name');

			expect(chromeBridge.send).toBeCalledWith({
				type: ChromeBridgeMessageType.FULL_SKELETON,
				content: rootsMessage.content,
			});
		});
	});

	describe('removeNodesRecursively', () => {
		it('should remove node and its children from currentNodes', () => {
			contentIsolated['addNodesRecursively']([
				{
					id: 're1',
					children: [
						{ id: 're2', children: [] },
						{ id: 're3', children: [] },
					],
				},
			] as unknown as ParsedNode[]);
			expect(contentIsolated['nodes'].size).toBe(3);

			contentIsolated['removeNodesRecursively']('re1');
			expect(contentIsolated['nodes'].size).toBe(0);
		});
	});

	describe('handleUnmountNodesPostMessage', () => {
		it('should remove root node from currentNodes', () => {
			contentIsolated['roots'] = [
				{
					library: Library.REACT,
					node: { id: 're1', children: [] } as unknown as ParsedReactNode,
				},
				{
					library: Library.SVELTE,
					node: { id: 'sv1', children: [] } as unknown as ParsedSvelteNode,
				},
			];
			contentIsolated['nodes'].set('re1', contentIsolated['roots'][0].node);
			contentIsolated['nodes'].set('sv1', contentIsolated['roots'][1].node);

			const message = {
				content: {
					parentId: null,
					id: 're1',
				},
			};

			contentIsolated['handleUnmountNodesPostMessage'](message as any);
			expect(contentIsolated['nodes'].size).toBe(1);
			expect(contentIsolated['nodes'].get('re1')).toBeUndefined();
			expect(contentIsolated['nodes'].get('sv1')).toBeDefined();
		});

		it('should remove child node from parent node', () => {
			contentIsolated['roots'] = [
				{
					library: Library.REACT,
					node: {
						id: 're1',
						children: [{ id: 're2', children: [] }],
					} as unknown as ParsedReactNode,
				},
			];
			contentIsolated['addNodesRecursively']([
				contentIsolated['roots'][0].node,
			]);

			const message = {
				content: {
					parentId: 're1',
					id: 're2',
				},
			};

			contentIsolated['handleUnmountNodesPostMessage'](message as any);
			expect(contentIsolated['nodes'].size).toBe(1);
			expect(contentIsolated['nodes'].get('re2')).toBeUndefined();
			expect(contentIsolated['nodes'].get('re1')?.children).toEqual([]);
			expect(contentIsolated['roots']).toEqual([
				{
					library: Library.REACT,
					node: { id: 're1', children: [] } as unknown as ParsedReactNode,
				},
			]);
		});
	});

	describe('handleInspectedDataPostMessage', () => {
		it('should send INSPECTED_DATA ChromeBridge message', () => {
			const message = {
				content: {
					id: 1,
					name: '1',
				},
			};

			contentIsolated['handleInspectedDataPostMessage'](message as any);

			expect(chromeBridge.send).toBeCalledTimes(1);
			expect(chromeBridge.send).toBeCalledWith({
				type: ChromeBridgeMessageType.INSPECTED_DATA,
				content: message.content,
			});
		});
	});

	describe('handleInspectElementBridgeMessage', () => {
		it('should send INSPECT_ELEMENT PostMessageBridge message', () => {
			const message = {
				content: [1, 2, 3],
			};

			contentIsolated['handleInspectElementBridgeMessage'](message as any);

			expect(postMessageBridge.send).toBeCalledTimes(1);
			expect(postMessageBridge.send).toBeCalledWith({
				type: PostMessageType.INSPECT_ELEMENT,
				content: message.content,
			});
		});
	});

	describe('handleHoverElementBridgeMessage', () => {
		it('should send HOVER_ELEMENT PostMessageBridge message', () => {
			const message = {
				content: 're1',
			};

			contentIsolated['handleHoverElementBridgeMessage'](message as any);

			expect(postMessageBridge.send).toBeCalledTimes(1);
			expect(postMessageBridge.send).toBeCalledWith({
				type: PostMessageType.HOVER_ELEMENT,
				content: message.content,
			});
		});
	});

	describe('handleIsLibraryAttachedChromeMessage', () => {
		it('should respond with librariesAttached', () => {
			contentIsolated['librariesAttached'].add(Library.REACT);
			contentIsolated['librariesAttached'].add(Library.SVELTE);

			const responseCallback = vi.fn();
			const message = {
				responseCallback,
			};

			contentIsolated['handleIsLibraryAttachedChromeMessage'](message as any);

			expect(responseCallback).toBeCalledTimes(1);
			expect(responseCallback).toBeCalledWith([Library.REACT, Library.SVELTE]);
		});
	});
});

// MOCKS
vi.mock('@pages/content/shared/PostMessageBridge', async () => {
	const actual = await vi.importActual(
		'@pages/content/shared/PostMessageBridge'
	);

	const onMessage = vi.fn();
	const send = vi.fn();

	return {
		...(actual as object),
		PostMessageBridge: {
			getInstance: () => ({
				onMessage,
				send,
			}),
		},
	};
});

vi.mock('@src/shared/chrome/chrome-message', async () => {
	const actual = await vi.importActual('@src/shared/chrome/chrome-message');

	return {
		...(actual as object),
		onChromeMessage: vi.fn(),
		sendChromeMessage: vi.fn(),
	};
});

vi.mock('@src/shared/chrome/ChromeBridge', async () => {
	const actual = await vi.importActual('@src/shared/chrome/ChromeBridge');

	const ChromeBridgeListener = vi.fn();
	ChromeBridgeListener.prototype.send = vi.fn();
	ChromeBridgeListener.prototype.onMessage = vi.fn();
	ChromeBridgeListener.prototype.isConnected = true;

	return {
		...(actual as object),
		ChromeBridgeListener,
	};
});

