/* eslint-disable @typescript-eslint/no-explicit-any */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ContentIsolated } from '@pages/content/content-isolated/ContentIsolated';
import {
	MountNodesPostMessage,
	PostMessageBridge,
	PostMessageSource,
	PostMessageType,
} from '@pages/content/shared/PostMessageBridge';
import {
	ChromeMessageSource,
	ChromeMessageType,
	onChromeMessage,
	sendChromeMessage,
} from '@src/shared/chrome-messages/chrome-message';
import {
	ChromeBridgeConnection,
	ChromeBridgeListener,
	ChromeBridgeMessageType,
} from '@src/shared/chrome-messages/ChromeBridge';
import { ParsedFiber } from '@src/shared/types/ParsedFiber';

describe('ContentIsolated', () => {
	let contentIsolated: ContentIsolated;

	let postMessageBridge: PostMessageBridge;
	let chromeBridgeConstructor = vi.fn();
	let chromeBridge: ChromeBridgeListener;

	beforeEach(() => {
		postMessageBridge = PostMessageBridge.getInstance(
			PostMessageSource.ISOLATED
		);
		chromeBridgeConstructor = ChromeBridgeListener as any;
		chromeBridge = new ChromeBridgeListener(
			ChromeBridgeConnection.PANEL_TO_CONTENT,
			() => {}
		);

		chromeBridgeConstructor.mockClear();
		contentIsolated = ContentIsolated.initialize();
	});

	afterEach(() => {
		ContentIsolated['instance'] = undefined;
		contentIsolated['libraryAttached'] = false;
		contentIsolated['currentFibers'].clear();
		vi.clearAllMocks();
	});

	describe('initialize', () => {
		it('should call ChromeBridgeListener constructor', () => {
			expect(chromeBridgeConstructor).toBeCalledTimes(1);
			expect(chromeBridgeConstructor).toBeCalledWith(
				ChromeBridgeConnection.PANEL_TO_CONTENT,
				expect.any(Function)
			);
		});

		it('should throw an error if ContentIsolated is already initialized', () => {
			expect(() => {
				ContentIsolated.initialize();
			}).toThrowError('ContentIsolated already initialized');
		});
	});

	describe('handleDevtoolsPanelConnection', () => {
		it('should send FULL_SKELETON message if currentFibers is not empty', () => {
			contentIsolated['currentFibers'].set(1, { name: '1' } as ParsedFiber);
			contentIsolated['currentFibers'].set(2, { name: '2' } as ParsedFiber);
			contentIsolated['handleDevtoolsPanelConnection']();

			expect(chromeBridge.send).toBeCalledWith({
				type: ChromeBridgeMessageType.FULL_SKELETON,
				content: [{ name: '1' }, { name: '2' }],
			});
		});

		it('should not send FULL_SKELETON message if currentFibers is empty', () => {
			contentIsolated['handleDevtoolsPanelConnection']();

			expect(chromeBridge.send).not.toBeCalled();
		});
	});

	describe('handleReactAttachedPostMessage', () => {
		it('should set libraryAttached to true', () => {
			contentIsolated['handleReactAttachedPostMessage']({} as any);

			expect(contentIsolated['libraryAttached']).toBe(true);
		});

		it('should send CREATE_DEVTOOLS_PANEL message', () => {
			contentIsolated['handleReactAttachedPostMessage']({} as any);

			expect(sendChromeMessage).toBeCalledTimes(1);
			expect(sendChromeMessage).toBeCalledWith({
				type: ChromeMessageType.CREATE_DEVTOOLS_PANEL,
				source: ChromeMessageSource.CONTENT_SCRIPT,
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

	describe('handleMountNodesPostMessage', () => {
		it('should add nodes to currentFibers and send FULL_SKELETON message', () => {
			const message = {
				content: [
					{
						pathFromRoot: [],
						node: { id: 1 },
						afterNode: null,
					},
				],
			};

			contentIsolated['handleMountNodesPostMessage'](message as any);

			expect(contentIsolated['currentFibers'].size).toBe(1);
			expect(contentIsolated['currentFibers'].get(1)).toBe(
				message.content[0].node
			);
			expect(chromeBridge.send).toBeCalledWith({
				type: ChromeBridgeMessageType.FULL_SKELETON,
				content: [message.content[0].node],
			});
		});

		it('should insert nodes at the beginning of the children array and send FULL_SKELETON message', () => {
			contentIsolated['currentFibers'].set(0, {
				id: 0,
				children: [],
			} as any);

			const message = {
				content: [
					{
						pathFromRoot: [0],
						node: { id: 1 },
						afterNode: null,
					},
				],
			};

			contentIsolated['handleMountNodesPostMessage'](message as any);

			expect(contentIsolated['currentFibers'].get(0)?.children).toEqual([
				message.content[0].node,
			]);
			expect(chromeBridge.send).toBeCalledWith({
				type: ChromeBridgeMessageType.FULL_SKELETON,
				content: [{ id: 0, children: [message.content[0].node] }],
			});
		});

		it('should insert nodes after the specified afterNode and send FULL_SKELETON message', () => {
			contentIsolated['currentFibers'].set(0, {
				id: 0,
				children: [
					{ id: 1, name: '1' },
					{ id: 2, name: '2' },
				],
			} as any);

			const message = {
				content: [
					{
						pathFromRoot: [0],
						node: { id: 3 },
						afterNode: 1,
					},
				],
			};

			contentIsolated['handleMountNodesPostMessage'](
				message as unknown as MountNodesPostMessage
			);

			expect(contentIsolated['currentFibers'].get(0)?.children).toEqual([
				{ id: 1, name: '1' },
				{ id: 3 },
				{ id: 2, name: '2' },
			]);
			expect(chromeBridge.send).toBeCalledWith({
				type: ChromeBridgeMessageType.FULL_SKELETON,
				content: [
					{
						id: 0,
						children: [{ id: 1, name: '1' }, { id: 3 }, { id: 2, name: '2' }],
					},
				],
			});
		});
	});

	describe('handleUnmountNodesPostMessage', () => {
		it('should remove root node from currentFibers and send FULL_SKELETON message', () => {
			contentIsolated['currentFibers'].set(1, { id: 1 } as ParsedFiber);
			contentIsolated['currentFibers'].set(2, { id: 2 } as ParsedFiber);

			const message = {
				content: [1],
			};

			contentIsolated['handleUnmountNodesPostMessage'](message as any);

			expect(contentIsolated['currentFibers'].size).toBe(1);
			expect(contentIsolated['currentFibers'].get(1)).toBeUndefined();
			expect(contentIsolated['currentFibers'].get(2)).toBeDefined();
			expect(chromeBridge.send).toBeCalledWith({
				type: ChromeBridgeMessageType.FULL_SKELETON,
				content: [{ id: 2 }],
			});
		});

		it('should remove child node from parent node and send FULL_SKELETON message', () => {
			contentIsolated['currentFibers'].set(1, {
				id: 1,
				children: [
					{ id: 2, name: '2' },
					{ id: 3, name: '3' },
				],
			} as ParsedFiber);

			const message = {
				content: [1, 3],
			};

			contentIsolated['handleUnmountNodesPostMessage'](message as any);

			expect(contentIsolated['currentFibers'].get(1)?.children).toEqual([
				{ id: 2, name: '2' },
			]);
			expect(chromeBridge.send).toBeCalledWith({
				type: ChromeBridgeMessageType.FULL_SKELETON,
				content: [{ id: 1, children: [{ id: 2, name: '2' }] }],
			});
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

	describe('handleIsReactAttachedChromeMessage', () => {
		it('should send responseCallback with libraryAttached value', () => {
			const responseCallback = vi.fn();

			contentIsolated['handleIsReactAttachedChromeMessage']({
				responseCallback,
			} as any);

			expect(responseCallback).toBeCalledTimes(1);
			expect(responseCallback).toBeCalledWith(false);
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

vi.mock('@src/shared/chrome-messages/chrome-message', async () => {
	const actual = await vi.importActual(
		'@src/shared/chrome-messages/chrome-message'
	);

	return {
		...(actual as object),
		onChromeMessage: vi.fn(),
		sendChromeMessage: vi.fn(),
	};
});

vi.mock('@src/shared/chrome-messages/ChromeBridge', async () => {
	const actual = await vi.importActual(
		'@src/shared/chrome-messages/ChromeBridge'
	);

	const ChromeBridgeListener = vi.fn();
	ChromeBridgeListener.prototype.send = vi.fn();
	ChromeBridgeListener.prototype.onMessage = vi.fn();
	ChromeBridgeListener.prototype.isConnected = true;

	return {
		...(actual as object),
		ChromeBridgeListener,
	};
});

