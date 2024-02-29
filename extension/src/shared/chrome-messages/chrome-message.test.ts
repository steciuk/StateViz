import { afterEach, describe, expect, it, vi } from 'vitest';
import { chrome } from 'vitest-chrome';

import {
	ChromeMessageSource,
	ChromeMessageType,
	onChromeMessage,
	sendChromeMessage,
	sendChromeMessageToTab,
} from '@src/shared/chrome-messages/chrome-message';

describe('onChromeMessage', () => {
	afterEach(() => {
		chrome.runtime.onMessage.clearListeners();
		chrome.runtime.sendMessage.mockReset();
		chrome.tabs.sendMessage.mockReset();
		chrome.runtime.onMessage.clearListeners();
	});

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
			sender: sender,
			responseCallback: responseCallback,
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
	it('should send a message with correct content', () => {
		const callback = vi.fn();
		const sender = { id: 'TEST_ID' };

		chrome.runtime.sendMessage.mockImplementation((message: unknown) => {
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

describe('sendChromeMessageToTab', () => {
	it('should send a message with correct content', () => {
		const callback = vi.fn();
		const tabId = 1;

		chrome.tabs.sendMessage.mockImplementation(
			(tabId: number, message: unknown) => {
				chrome.runtime.onMessage.callListeners(
					message,
					{ tab: { id: tabId } as chrome.tabs.Tab },
					() => {}
				);
				return Promise.resolve();
			}
		);

		chrome.runtime.onMessage.addListener(callback);

		sendChromeMessageToTab(tabId, {
			source: ChromeMessageSource.CONTENT_SCRIPT,
			type: ChromeMessageType.CREATE_DEVTOOLS_PANEL,
		});

		expect(callback).toBeCalledTimes(1);
		expect(callback).toBeCalledWith(
			{
				source: ChromeMessageSource.CONTENT_SCRIPT,
				type: ChromeMessageType.CREATE_DEVTOOLS_PANEL,
			},
			{ tab: { id: tabId } },
			expect.any(Function)
		);
	});
});

describe('sendChromeMessage - onChromeMessage', () => {
	it('should send and receive a message with correct content', () => {
		const callback = vi.fn();
		const sender = { id: 'TEST_ID' };
		const responseCallback = vi.fn();

		chrome.runtime.sendMessage.mockImplementation((message: unknown) => {
			chrome.runtime.onMessage.callListeners(message, sender, responseCallback);
			return Promise.resolve();
		});

		onChromeMessage(callback);

		sendChromeMessage({
			source: ChromeMessageSource.CONTENT_SCRIPT,
			type: ChromeMessageType.CREATE_DEVTOOLS_PANEL,
		});

		expect(callback).toBeCalledTimes(1);
		expect(callback).toBeCalledWith({
			source: ChromeMessageSource.CONTENT_SCRIPT,
			type: ChromeMessageType.CREATE_DEVTOOLS_PANEL,
			sender,
			responseCallback,
		});
	});
});

describe('sendChromeMessageToTab - onChromeMessage', () => {
	it('should send and receive a message with correct content', () => {
		const callback = vi.fn();
		const tabId = 1;
		const responseCallback = vi.fn();

		chrome.tabs.sendMessage.mockImplementation(
			(tabId: number, message: unknown) => {
				chrome.runtime.onMessage.callListeners(
					message,
					{ tab: { id: tabId } as chrome.tabs.Tab },
					responseCallback
				);
				return Promise.resolve();
			}
		);

		onChromeMessage(callback);

		sendChromeMessageToTab(tabId, {
			source: ChromeMessageSource.CONTENT_SCRIPT,
			type: ChromeMessageType.CREATE_DEVTOOLS_PANEL,
		});

		expect(callback).toBeCalledTimes(1);
		expect(callback).toBeCalledWith({
			source: ChromeMessageSource.CONTENT_SCRIPT,
			type: ChromeMessageType.CREATE_DEVTOOLS_PANEL,
			sender: { tab: { id: tabId } },
			responseCallback: responseCallback,
		});
	});
});
