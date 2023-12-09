import { describe, expect, it, vi } from 'vitest';
import { chrome } from 'vitest-chrome';

import {
	ChromeMessageSource,
	ChromeMessageType,
	onChromeMessage,
	sendChromeMessage,
} from '@src/shared/chrome-messages/chrome-message';

describe('onChromeMessage', () => {
	it('should add and remove a listener', () => {
		const callback = vi.fn();

		expect(chrome.runtime.onMessage.hasListeners()).toBe(false);

		const removeListener = onChromeMessage(callback);

		expect(chrome.runtime.onMessage.hasListeners()).toBe(true);

		removeListener();

		expect(chrome.runtime.onMessage.hasListeners()).toBe(false);
		expect(callback).not.toBeCalled();
	});

	it('should call the callback function with the correct arguments', () => {
		const callback = vi.fn();
		const message = { type: 'TEST' };
		const sender = { id: 'TEST_ID' };
		const responseCallback = vi.fn();

		expect(chrome.runtime.onMessage.hasListeners()).toBe(false);

		const removeListener = onChromeMessage(callback);

		expect(callback).not.toBeCalled();
		expect(chrome.runtime.onMessage.hasListeners()).toBe(true);

		chrome.runtime.onMessage.callListeners(message, sender, responseCallback);

		expect(callback).toBeCalledWith({
			...message,
			sender,
			responseCallback,
		});
		expect(chrome.runtime.onMessage.hasListeners()).toBe(true);
		expect(callback).toBeCalledTimes(1);
		expect(responseCallback).not.toBeCalled();

		removeListener();
	});

	it('should not call the callback function after the listener is removed', () => {
		const callback = vi.fn();
		const message = { type: 'TEST' };
		const sender = { id: 'TEST_ID' };
		const responseCallback = vi.fn();

		expect(chrome.runtime.onMessage.hasListeners()).toBe(false);

		const removeListener = onChromeMessage(callback);
		removeListener();

		chrome.runtime.onMessage.callListeners(message, sender, responseCallback);

		expect(callback).not.toBeCalled();
		expect(chrome.runtime.onMessage.hasListeners()).toBe(false);
		expect(responseCallback).not.toBeCalled();
	});
});

describe('sendChromeMessage', () => {
	it('should send a message', () => {
		const callback = vi.fn();
		const sender = { id: 'TEST_ID' };

		chrome.runtime.sendMessage.mockImplementation((message: unknown) => {
			console.log('message', message);
			chrome.runtime.onMessage.callListeners(
				message,
				{ id: 'TEST_ID' },
				() => {}
			);
			return Promise.resolve();
		});

		chrome.runtime.onMessage.addListener(callback);

		sendChromeMessage({
			source: ChromeMessageSource.CONTENT_SCRIPT,
			type: ChromeMessageType.CREATE_DEVTOOLS_PANEL,
		});

		expect(callback).toBeCalledTimes(1);
		expect(callback).toBeCalledWith(
			{
				source: ChromeMessageSource.CONTENT_SCRIPT,
				type: ChromeMessageType.CREATE_DEVTOOLS_PANEL,
			},
			sender,
			expect.any(Function)
		);
	});
});
