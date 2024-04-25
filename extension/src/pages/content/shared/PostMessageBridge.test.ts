import { describe, expect, it, vi } from 'vitest';

import {
	PostMessage,
	PostMessageBridge,
	PostMessageSource,
	PostMessageType,
} from '@pages/content/shared/PostMessageBridge';
import { OmitFromUnion } from '@src/shared/utility-types';

// TODO: add inner describe for each function
describe('PostMessageBridge', () => {
	it('should send a message with the correct content', () => {
		const source = PostMessageSource.ISOLATED;
		const message: OmitFromUnion<PostMessage, 'source'> = {
			type: PostMessageType.INSPECT_ELEMENT,
			content: ['re1', 're2', 're3'],
		};
		const postMessageMock = vi.spyOn(window, 'postMessage');
		const bridge = PostMessageBridge.getInstance(PostMessageSource.ISOLATED);

		bridge.send(message);

		expect(postMessageMock).toBeCalledWith(
			{ source, ...message },
			window.origin
		);
	});

	it('should not call the callback when receiving message without the source', () => {
		const message = {
			type: PostMessageType.INSPECT_ELEMENT,
			content: [1, 2, 3],
		};
		const callback = vi.fn();
		const bridge = PostMessageBridge.getInstance(PostMessageSource.ISOLATED);
		bridge.onMessage(callback);

		window.dispatchEvent(
			new MessageEvent('message', { data: message, origin: window.origin })
		);

		expect(callback).not.toBeCalled();
	});

	it('should not call the callback when receiving message with the same source', () => {
		const source = PostMessageSource.ISOLATED;
		const message = {
			source,
			type: PostMessageType.INSPECT_ELEMENT,
			content: [1, 2, 3],
		};
		const callback = vi.fn();
		const bridge = PostMessageBridge.getInstance(source);
		bridge.onMessage(callback);

		window.dispatchEvent(
			new MessageEvent('message', { data: message, origin: window.origin })
		);

		expect(callback).not.toBeCalled();
	});

	it('should call the callback when receiving a message from different source', () => {
		const message = {
			source: PostMessageSource.MAIN,
			type: PostMessageType.INSPECT_ELEMENT,
			content: [1, 2, 3],
		};
		const callback = vi.fn();

		const bridge = PostMessageBridge.getInstance(PostMessageSource.ISOLATED);
		bridge.onMessage(callback);

		window.dispatchEvent(
			new MessageEvent('message', { data: message, origin: window.origin })
		);

		expect(callback).toBeCalledTimes(1);
		expect(callback).toBeCalledWith(message);
	});

	it('should not call the callback when receiving a message from different origin', () => {
		const message = {
			source: PostMessageSource.MAIN,
			type: PostMessageType.INSPECT_ELEMENT,
			content: [1, 2, 3],
		};
		const callback = vi.fn();

		const bridge = PostMessageBridge.getInstance(PostMessageSource.ISOLATED);
		bridge.onMessage(callback);

		window.dispatchEvent(
			new MessageEvent('message', { data: message, origin: 'different-origin' })
		);

		expect(callback).not.toBeCalled();
	});

	it('should not call the callback when the listener is removed', () => {
		const message = {
			source: PostMessageSource.MAIN,
			type: PostMessageType.INSPECT_ELEMENT,
			content: [1, 2, 3],
		};
		const callback = vi.fn();
		const bridge = PostMessageBridge.getInstance(PostMessageSource.ISOLATED);

		const removeListener = bridge.onMessage(callback);
		removeListener();

		window.dispatchEvent(
			new MessageEvent('message', { data: message, origin: window.origin })
		);

		expect(callback).not.toBeCalled();
	});

	it('should call the callback only once when registered with once', () => {
		const message = {
			source: PostMessageSource.MAIN,
			type: PostMessageType.INSPECT_ELEMENT,
			content: [1, 2, 3],
		};
		const callback = vi.fn();
		const bridge = PostMessageBridge.getInstance(PostMessageSource.ISOLATED);
		bridge.onMessageOnce(callback);

		window.dispatchEvent(
			new MessageEvent('message', { data: message, origin: window.origin })
		);

		expect(callback).toBeCalledTimes(1);
		expect(callback).toBeCalledWith(message);

		window.dispatchEvent(
			new MessageEvent('message', { data: message, origin: window.origin })
		);

		expect(callback).toBeCalledTimes(1);
	});

	it('should throw an error when trying to get instance with different source in the same context', () => {
		PostMessageBridge.getInstance(PostMessageSource.ISOLATED);
		expect(() =>
			PostMessageBridge.getInstance(PostMessageSource.MAIN)
		).toThrowError(
			'PostMessageBridge already initialized with different source'
		);
	});
});

