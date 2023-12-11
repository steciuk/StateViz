import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { chrome } from 'vitest-chrome';
import { Runtime } from 'vitest-chrome/types/vitest-chrome';

import {
	ChromeBridgeConnection,
	ChromeBridgeConnector,
	ChromeBridgeListener,
	ChromeBridgeMessageType,
	ChromeBridgeToTabConnector,
} from '@src/shared/chrome-messages/ChromeBridge';

// TODO: add inner describe for each function
describe('ChromeBridgeConnector', () => {
	let portMock = new PortMock();

	beforeEach(() => {
		portMock = new PortMock();
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		chrome.runtime.connect.mockImplementation((connectInfo: any) => {
			portMock.name = connectInfo.name;
			return portMock as unknown as chrome.runtime.Port;
		});
	});

	afterEach(() => {
		chrome.runtime.connect.mockReset();
	});

	it('should connect and disconnect successfully', () => {
		const bridge = new ChromeBridgeConnector(
			ChromeBridgeConnection.PANEL_TO_CONTENT
		);

		expect(bridge.isConnected).toBe(false);
		expect(chrome.runtime.connect).not.toBeCalled();
		expect(portMock.disconnect).not.toBeCalled();
		expect(portMock.onDisconnect.addListener).not.toBeCalled();

		bridge.connect();

		expect(bridge['port']?.name).toBe(ChromeBridgeConnection.PANEL_TO_CONTENT);
		expect(chrome.runtime.connect).toBeCalledWith({
			name: ChromeBridgeConnection.PANEL_TO_CONTENT,
		});
		expect(portMock.onDisconnect.addListener).toBeCalledTimes(1);
		expect(portMock.disconnect).not.toBeCalled();
		expect(bridge.isConnected).toBe(true);

		bridge.disconnect();

		expect(portMock.onDisconnect.addListener).toBeCalledTimes(1);
		expect(portMock.disconnect).toBeCalledTimes(1);
		expect(bridge.isConnected).toBe(false);
	});

	it('should throw an error when connecting twice', () => {
		const bridge = new ChromeBridgeConnector(
			ChromeBridgeConnection.PANEL_TO_CONTENT
		);

		bridge.connect();

		expect(() => {
			bridge.connect();
		}).toThrowError('Already connected');

		expect(chrome.runtime.connect).toBeCalledTimes(1);
		expect(portMock.onDisconnect.addListener).toBeCalledTimes(1);
		expect(portMock.disconnect).not.toBeCalled();
	});

	it('should throw an error when sending a message without connection', () => {
		const bridge = new ChromeBridgeConnector(
			ChromeBridgeConnection.PANEL_TO_CONTENT
		);

		expect(() => {
			bridge.send({
				type: ChromeBridgeMessageType.INSPECT_ELEMENT,
				content: [],
			});
		}).toThrowError('Not connected');
	});

	it('should call port postMessage on send with correct arguments if connected', () => {
		const bridge = new ChromeBridgeConnector(
			ChromeBridgeConnection.PANEL_TO_CONTENT
		);

		bridge.connect();

		expect(portMock.postMessage).not.toBeCalled();

		bridge.send({
			type: ChromeBridgeMessageType.INSPECT_ELEMENT,
			content: [],
		});

		expect(portMock.postMessage).toBeCalledWith({
			type: ChromeBridgeMessageType.INSPECT_ELEMENT,
			content: [],
		});
		expect(portMock.postMessage).toBeCalledTimes(1);
	});

	it('should properly register and remove message listeners via onMessage on port after connection', () => {
		const bridge = new ChromeBridgeConnector(
			ChromeBridgeConnection.PANEL_TO_CONTENT
		);
		const onMessageCallback = vi.fn();

		bridge.connect();
		const removeListener = bridge.onMessage(onMessageCallback);

		expect(portMock.onMessage.addListener).toBeCalledTimes(1);
		expect(portMock.onMessage.addListener).toBeCalledWith(onMessageCallback);

		removeListener();

		expect(portMock.onMessage.removeListener).toBeCalledTimes(1);
		expect(portMock.onMessage.removeListener).toBeCalledWith(onMessageCallback);
		expect(onMessageCallback).not.toBeCalled();
	});

	it('should register pending message listeners when not connected', () => {
		const bridge = new ChromeBridgeConnector(
			ChromeBridgeConnection.PANEL_TO_CONTENT
		);
		const onMessageCallback = vi.fn();

		bridge.onMessage(onMessageCallback);

		expect(bridge['pendingListeners']).toEqual([onMessageCallback]);
		expect(portMock.onMessage.addListener).not.toBeCalled();

		bridge.connect();

		expect(portMock.onMessage.addListener).toBeCalledTimes(1);
		expect(portMock.onMessage.addListener).toBeCalledWith(onMessageCallback);
	});

	it('should receive messages from the port when onMessage registered before connection', () => {
		const bridge = new ChromeBridgeConnector(
			ChromeBridgeConnection.PANEL_TO_CONTENT
		);

		const onMessageCallback = vi.fn();
		bridge.onMessage(onMessageCallback);

		expect(onMessageCallback).not.toBeCalled();

		bridge.connect();

		expect(onMessageCallback).not.toBeCalled();

		portMock.postMessage({
			type: ChromeBridgeMessageType.INSPECT_ELEMENT,
			content: [],
		});

		expect(onMessageCallback).toBeCalledTimes(1);
		expect(onMessageCallback).toBeCalledWith({
			type: ChromeBridgeMessageType.INSPECT_ELEMENT,
			content: [],
		});
	});

	it('should receive messages from the port when onMessage registered after connection', () => {
		const bridge = new ChromeBridgeConnector(
			ChromeBridgeConnection.PANEL_TO_CONTENT
		);
		bridge.connect();
		const onMessageCallback = vi.fn();
		bridge.onMessage(onMessageCallback);

		expect(onMessageCallback).not.toBeCalled();

		portMock.postMessage({
			type: ChromeBridgeMessageType.INSPECT_ELEMENT,
			content: [],
		});

		expect(onMessageCallback).toBeCalledTimes(1);
		expect(onMessageCallback).toBeCalledWith({
			type: ChromeBridgeMessageType.INSPECT_ELEMENT,
			content: [],
		});
	});

	it('should not receive messages from the port when disconnect', () => {
		const bridge = new ChromeBridgeConnector(
			ChromeBridgeConnection.PANEL_TO_CONTENT
		);
		bridge.connect();
		const onMessageCallback = vi.fn();
		bridge.onMessage(onMessageCallback);

		expect(onMessageCallback).not.toBeCalled();

		bridge.disconnect();

		portMock.postMessage({
			type: ChromeBridgeMessageType.INSPECT_ELEMENT,
			content: [],
		});

		expect(onMessageCallback).not.toBeCalled();
	});

	it('should receive messages from the port when reconnect', () => {
		const bridge = new ChromeBridgeConnector(
			ChromeBridgeConnection.PANEL_TO_CONTENT
		);
		bridge.connect();
		const onMessageCallback = vi.fn();
		bridge.onMessage(onMessageCallback);

		expect(onMessageCallback).not.toBeCalled();

		bridge.disconnect();
		bridge.connect();

		portMock.postMessage({
			type: ChromeBridgeMessageType.INSPECT_ELEMENT,
			content: [],
		});

		expect(onMessageCallback).toBeCalledTimes(1);
		expect(onMessageCallback).toBeCalledWith({
			type: ChromeBridgeMessageType.INSPECT_ELEMENT,
			content: [],
		});
	});

	it('should not clear pending message listeners when connecting or disconnecting', () => {
		const bridge = new ChromeBridgeConnector(
			ChromeBridgeConnection.PANEL_TO_CONTENT
		);
		const onMessageCallback = vi.fn();

		bridge.onMessage(onMessageCallback);

		expect(bridge['pendingListeners']).toEqual([onMessageCallback]);

		bridge.connect();

		expect(bridge['pendingListeners']).toEqual([onMessageCallback]);

		bridge.disconnect();

		expect(bridge['pendingListeners']).toEqual([onMessageCallback]);
	});
});

describe('ChromeBridgeToTabConnector', () => {
	let portMock = new PortMock();

	beforeEach(() => {
		portMock = new PortMock();
		chrome.tabs.connect.mockImplementation(
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			(_tabId: number, connectInfo: any) => {
				portMock.name = connectInfo.name;
				return portMock as unknown as chrome.runtime.Port;
			}
		);
	});

	afterEach(() => {
		chrome.tabs.connect.mockReset();
	});

	it('should connect and disconnect successfully', () => {
		const bridge = new ChromeBridgeToTabConnector(
			ChromeBridgeConnection.PANEL_TO_CONTENT,
			1
		);

		expect(bridge.isConnected).toBe(false);
		expect(chrome.tabs.connect).not.toBeCalled();
		expect(portMock.disconnect).not.toBeCalled();
		expect(portMock.onDisconnect.addListener).not.toBeCalled();

		bridge.connect();

		expect(bridge['port']?.name).toBe(ChromeBridgeConnection.PANEL_TO_CONTENT);
		expect(chrome.tabs.connect).toBeCalledWith(1, {
			name: ChromeBridgeConnection.PANEL_TO_CONTENT,
		});
		expect(portMock.onDisconnect.addListener).toBeCalledTimes(1);
		expect(portMock.disconnect).not.toBeCalled();
		expect(bridge.isConnected).toBe(true);

		bridge.disconnect();

		expect(portMock.onDisconnect.addListener).toBeCalledTimes(1);
		expect(portMock.disconnect).toBeCalledTimes(1);
		expect(bridge.isConnected).toBe(false);
	});

	it('should throw an error when connecting twice', () => {
		const bridge = new ChromeBridgeToTabConnector(
			ChromeBridgeConnection.PANEL_TO_CONTENT,
			1
		);

		bridge.connect();

		expect(() => {
			bridge.connect();
		}).toThrowError('Already connected');

		expect(chrome.tabs.connect).toBeCalledTimes(1);
		expect(portMock.onDisconnect.addListener).toBeCalledTimes(1);
		expect(portMock.disconnect).not.toBeCalled();
	});

	it('should throw an error when sending a message without connection', () => {
		const bridge = new ChromeBridgeToTabConnector(
			ChromeBridgeConnection.PANEL_TO_CONTENT,
			1
		);

		expect(() => {
			bridge.send({
				type: ChromeBridgeMessageType.INSPECT_ELEMENT,
				content: [],
			});
		}).toThrowError('Not connected');
	});

	it('should call port postMessage on send with correct arguments if connected', () => {
		const bridge = new ChromeBridgeToTabConnector(
			ChromeBridgeConnection.PANEL_TO_CONTENT,
			1
		);

		bridge.connect();

		expect(portMock.postMessage).not.toBeCalled();

		bridge.send({
			type: ChromeBridgeMessageType.INSPECT_ELEMENT,
			content: [],
		});

		expect(portMock.postMessage).toBeCalledWith({
			type: ChromeBridgeMessageType.INSPECT_ELEMENT,
			content: [],
		});
		expect(portMock.postMessage).toBeCalledTimes(1);
	});

	it('should properly register and remove message listeners via onMessage on port after connection', () => {
		const bridge = new ChromeBridgeToTabConnector(
			ChromeBridgeConnection.PANEL_TO_CONTENT,
			1
		);
		const onMessageCallback = vi.fn();

		bridge.connect();
		const removeListener = bridge.onMessage(onMessageCallback);

		expect(portMock.onMessage.addListener).toBeCalledTimes(1);
		expect(portMock.onMessage.addListener).toBeCalledWith(onMessageCallback);

		removeListener();

		expect(portMock.onMessage.removeListener).toBeCalledTimes(1);
		expect(portMock.onMessage.removeListener).toBeCalledWith(onMessageCallback);
		expect(onMessageCallback).not.toBeCalled();
	});

	it('should register pending message listeners when not connected', () => {
		const bridge = new ChromeBridgeToTabConnector(
			ChromeBridgeConnection.PANEL_TO_CONTENT,
			1
		);
		const onMessageCallback = vi.fn();

		bridge.onMessage(onMessageCallback);

		expect(bridge['pendingListeners']).toEqual([onMessageCallback]);
		expect(portMock.onMessage.addListener).not.toBeCalled();

		bridge.connect();

		expect(portMock.onMessage.addListener).toBeCalledTimes(1);
		expect(portMock.onMessage.addListener).toBeCalledWith(onMessageCallback);
	});

	it('should receive messages from the port when onMessage registered before connection', () => {
		const bridge = new ChromeBridgeToTabConnector(
			ChromeBridgeConnection.PANEL_TO_CONTENT,
			1
		);
		const onMessageCallback = vi.fn();
		bridge.onMessage(onMessageCallback);

		expect(onMessageCallback).not.toBeCalled();

		bridge.connect();

		expect(onMessageCallback).not.toBeCalled();

		portMock.postMessage({
			type: ChromeBridgeMessageType.INSPECT_ELEMENT,
			content: [],
		});

		expect(onMessageCallback).toBeCalledTimes(1);
		expect(onMessageCallback).toBeCalledWith({
			type: ChromeBridgeMessageType.INSPECT_ELEMENT,
			content: [],
		});
	});

	it('should receive messages from the port when onMessage registered after connection', () => {
		const bridge = new ChromeBridgeToTabConnector(
			ChromeBridgeConnection.PANEL_TO_CONTENT,
			1
		);
		bridge.connect();
		const onMessageCallback = vi.fn();
		bridge.onMessage(onMessageCallback);

		expect(onMessageCallback).not.toBeCalled();

		portMock.postMessage({
			type: ChromeBridgeMessageType.INSPECT_ELEMENT,
			content: [],
		});

		expect(onMessageCallback).toBeCalledTimes(1);
		expect(onMessageCallback).toBeCalledWith({
			type: ChromeBridgeMessageType.INSPECT_ELEMENT,
			content: [],
		});
	});

	it('should not receive messages from the port when disconnect', () => {
		const bridge = new ChromeBridgeToTabConnector(
			ChromeBridgeConnection.PANEL_TO_CONTENT,
			1
		);
		bridge.connect();
		const onMessageCallback = vi.fn();
		bridge.onMessage(onMessageCallback);

		expect(onMessageCallback).not.toBeCalled();

		bridge.disconnect();

		portMock.postMessage({
			type: ChromeBridgeMessageType.INSPECT_ELEMENT,
			content: [],
		});

		expect(onMessageCallback).not.toBeCalled();
	});

	it('should receive messages from the port when reconnect', () => {
		const bridge = new ChromeBridgeToTabConnector(
			ChromeBridgeConnection.PANEL_TO_CONTENT,
			1
		);
		bridge.connect();
		const onMessageCallback = vi.fn();
		bridge.onMessage(onMessageCallback);

		expect(onMessageCallback).not.toBeCalled();

		bridge.disconnect();
		bridge.connect();

		portMock.postMessage({
			type: ChromeBridgeMessageType.INSPECT_ELEMENT,
			content: [],
		});

		expect(onMessageCallback).toBeCalledTimes(1);
		expect(onMessageCallback).toBeCalledWith({
			type: ChromeBridgeMessageType.INSPECT_ELEMENT,
			content: [],
		});
	});

	it('should not clear pending message listeners when connecting or disconnecting', () => {
		const bridge = new ChromeBridgeToTabConnector(
			ChromeBridgeConnection.PANEL_TO_CONTENT,
			1
		);
		const onMessageCallback = vi.fn();

		bridge.onMessage(onMessageCallback);

		expect(bridge['pendingListeners']).toEqual([onMessageCallback]);

		bridge.connect();

		expect(bridge['pendingListeners']).toEqual([onMessageCallback]);

		bridge.disconnect();

		expect(bridge['pendingListeners']).toEqual([onMessageCallback]);
	});
});

describe('ChromeBridgeListener', () => {
	let portMock = new PortMock();

	beforeEach(() => {
		portMock = new PortMock();
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		chrome.runtime.connect.mockImplementation((connectInfo: any) => {
			portMock.name = connectInfo.name;
			return portMock as unknown as chrome.runtime.Port;
		});
	});

	afterEach(() => {
		chrome.runtime.connect.mockReset();
		chrome.runtime.onConnect.clearListeners();
	});

	it('should add chrome.runtime.onConnect listener', () => {
		expect(chrome.runtime.onConnect.hasListeners()).toBe(false);

		new ChromeBridgeListener(ChromeBridgeConnection.PANEL_TO_CONTENT);

		expect(chrome.runtime.onConnect.hasListeners()).toBe(true);
	});

	it('should not connect if the port name does not match', () => {
		const bridge = new ChromeBridgeListener(
			ChromeBridgeConnection.PANEL_TO_CONTENT
		);

		expect(bridge.isConnected).toBe(false);

		chrome.runtime.onConnect.callListeners(portMock as unknown as Runtime.Port);

		expect(bridge.isConnected).toBe(false);
		expect(portMock.onDisconnect.addListener).not.toBeCalled();
	});

	it('should connect if the port name matches', () => {
		const bridge = new ChromeBridgeListener(
			ChromeBridgeConnection.PANEL_TO_CONTENT
		);
		portMock.name = ChromeBridgeConnection.PANEL_TO_CONTENT;

		expect(bridge.isConnected).toBe(false);

		chrome.runtime.onConnect.callListeners(portMock as unknown as Runtime.Port);

		expect(bridge.isConnected).toBe(true);
		expect(portMock.onDisconnect.addListener).toBeCalledTimes(1);
	});

	it('should call onConnect callback when connected', () => {
		const onConnectCallback = vi.fn();
		const bridge = new ChromeBridgeListener(
			ChromeBridgeConnection.PANEL_TO_CONTENT,
			onConnectCallback
		);
		portMock.name = ChromeBridgeConnection.PANEL_TO_CONTENT;

		expect(bridge.isConnected).toBe(false);
		expect(onConnectCallback).not.toBeCalled();

		chrome.runtime.onConnect.callListeners(portMock as unknown as Runtime.Port);

		expect(bridge.isConnected).toBe(true);
		expect(onConnectCallback).toBeCalledTimes(1);

		chrome.runtime.onConnect.callListeners(portMock as unknown as Runtime.Port);

		expect(bridge.isConnected).toBe(true);
		expect(onConnectCallback).toBeCalledTimes(2);
	});

	it('should throw an error when sending a message without connection', () => {
		const bridge = new ChromeBridgeListener(
			ChromeBridgeConnection.PANEL_TO_CONTENT
		);

		expect(() => {
			bridge.send({
				type: ChromeBridgeMessageType.INSPECT_ELEMENT,
				content: [],
			});
		}).toThrowError('Not connected');
	});

	it('should call port postMessage on send with correct arguments if connected', () => {
		const bridge = new ChromeBridgeListener(
			ChromeBridgeConnection.PANEL_TO_CONTENT
		);
		portMock.name = ChromeBridgeConnection.PANEL_TO_CONTENT;
		chrome.runtime.onConnect.callListeners(portMock as unknown as Runtime.Port);

		expect(portMock.postMessage).not.toBeCalled();

		bridge.send({
			type: ChromeBridgeMessageType.INSPECT_ELEMENT,
			content: [],
		});

		expect(portMock.postMessage).toBeCalledWith({
			type: ChromeBridgeMessageType.INSPECT_ELEMENT,
			content: [],
		});
		expect(portMock.postMessage).toBeCalledTimes(1);
	});

	it('should properly register and remove message listeners via onMessage on port after connection', () => {
		const bridge = new ChromeBridgeListener(
			ChromeBridgeConnection.PANEL_TO_CONTENT
		);
		const onMessageCallback = vi.fn();
		portMock.name = ChromeBridgeConnection.PANEL_TO_CONTENT;
		chrome.runtime.onConnect.callListeners(portMock as unknown as Runtime.Port);

		expect(portMock.onMessage.addListener).toBeCalledTimes(0);

		const removeListener = bridge.onMessage(onMessageCallback);

		expect(portMock.onMessage.addListener).toBeCalledTimes(1);
		expect(portMock.onMessage.addListener).toBeCalledWith(onMessageCallback);

		removeListener();

		expect(portMock.onMessage.removeListener).toBeCalledTimes(1);
		expect(portMock.onMessage.removeListener).toBeCalledWith(onMessageCallback);
		expect(onMessageCallback).not.toBeCalled();
	});

	it('should register pending message listeners when not connected', () => {
		const bridge = new ChromeBridgeListener(
			ChromeBridgeConnection.PANEL_TO_CONTENT
		);
		const onMessageCallback = vi.fn();

		bridge.onMessage(onMessageCallback);

		expect(bridge['pendingListeners']).toEqual([onMessageCallback]);
		expect(portMock.onMessage.addListener).not.toBeCalled();

		portMock.name = ChromeBridgeConnection.PANEL_TO_CONTENT;
		chrome.runtime.onConnect.callListeners(portMock as unknown as Runtime.Port);

		expect(portMock.onMessage.addListener).toBeCalledTimes(1);
		expect(portMock.onMessage.addListener).toBeCalledWith(onMessageCallback);
	});

	it('should receive messages from the port when onMessage registered before connection', () => {
		const bridge = new ChromeBridgeListener(
			ChromeBridgeConnection.PANEL_TO_CONTENT
		);
		const onMessageCallback = vi.fn();
		bridge.onMessage(onMessageCallback);

		expect(onMessageCallback).not.toBeCalled();

		portMock.name = ChromeBridgeConnection.PANEL_TO_CONTENT;
		chrome.runtime.onConnect.callListeners(portMock as unknown as Runtime.Port);

		expect(onMessageCallback).not.toBeCalled();

		portMock.postMessage({
			type: ChromeBridgeMessageType.INSPECT_ELEMENT,
			content: [],
		});

		expect(onMessageCallback).toBeCalledTimes(1);
		expect(onMessageCallback).toBeCalledWith({
			type: ChromeBridgeMessageType.INSPECT_ELEMENT,
			content: [],
		});
	});

	it('should receive messages from the port when onMessage registered after connection', () => {
		const bridge = new ChromeBridgeListener(
			ChromeBridgeConnection.PANEL_TO_CONTENT
		);
		portMock.name = ChromeBridgeConnection.PANEL_TO_CONTENT;
		chrome.runtime.onConnect.callListeners(portMock as unknown as Runtime.Port);
		const onMessageCallback = vi.fn();
		bridge.onMessage(onMessageCallback);

		expect(onMessageCallback).not.toBeCalled();

		portMock.postMessage({
			type: ChromeBridgeMessageType.INSPECT_ELEMENT,
			content: [],
		});

		expect(onMessageCallback).toBeCalledTimes(1);
		expect(onMessageCallback).toBeCalledWith({
			type: ChromeBridgeMessageType.INSPECT_ELEMENT,
			content: [],
		});
	});

	it('should not receive messages from the port when disconnect', () => {
		const bridge = new ChromeBridgeListener(
			ChromeBridgeConnection.PANEL_TO_CONTENT
		);
		portMock.name = ChromeBridgeConnection.PANEL_TO_CONTENT;
		chrome.runtime.onConnect.callListeners(portMock as unknown as Runtime.Port);
		const onMessageCallback = vi.fn();
		bridge.onMessage(onMessageCallback);

		expect(onMessageCallback).not.toBeCalled();

		bridge.disconnect();

		portMock.postMessage({
			type: ChromeBridgeMessageType.INSPECT_ELEMENT,
			content: [],
		});

		expect(onMessageCallback).not.toBeCalled();
	});

	it('should receive messages from the port when reconnect', () => {
		const bridge = new ChromeBridgeListener(
			ChromeBridgeConnection.PANEL_TO_CONTENT
		);
		portMock.name = ChromeBridgeConnection.PANEL_TO_CONTENT;
		chrome.runtime.onConnect.callListeners(portMock as unknown as Runtime.Port);
		const onMessageCallback = vi.fn();
		bridge.onMessage(onMessageCallback);

		expect(onMessageCallback).not.toBeCalled();

		bridge.disconnect();
		chrome.runtime.onConnect.callListeners(portMock as unknown as Runtime.Port);

		portMock.postMessage({
			type: ChromeBridgeMessageType.INSPECT_ELEMENT,
			content: [],
		});

		expect(onMessageCallback).toBeCalledTimes(1);
		expect(onMessageCallback).toBeCalledWith({
			type: ChromeBridgeMessageType.INSPECT_ELEMENT,
			content: [],
		});
	});

	it('should not clear pending message listeners when connecting or disconnecting', () => {
		const bridge = new ChromeBridgeListener(
			ChromeBridgeConnection.PANEL_TO_CONTENT
		);
		const onMessageCallback = vi.fn();

		bridge.onMessage(onMessageCallback);

		expect(bridge['pendingListeners']).toEqual([onMessageCallback]);

		bridge.connect();

		expect(bridge['pendingListeners']).toEqual([onMessageCallback]);

		bridge.disconnect();

		expect(bridge['pendingListeners']).toEqual([onMessageCallback]);
	});
});

describe('ChromeBridgeConnector - ChromeBridgeListener', () => {
	let connectorPortMock = new PortMock();
	let listenerPortMock = new PortMock();

	beforeEach(() => {
		connectorPortMock = new PortMock();
		listenerPortMock = new PortMock();
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		chrome.runtime.connect.mockImplementation((connectInfo: any) => {
			const connectorPostMessage =
				connectorPortMock.postMessage.bind(connectorPortMock);
			const listenerPostMessage =
				listenerPortMock.postMessage.bind(listenerPortMock);
			connectorPortMock.name = connectInfo.name;
			connectorPortMock.postMessage = vi.fn((message) =>
				listenerPostMessage(message)
			);
			listenerPortMock.name = connectInfo.name;
			listenerPortMock.postMessage = vi.fn((message) =>
				connectorPostMessage(message)
			);
			chrome.runtime.onConnect.callListeners(
				listenerPortMock as unknown as Runtime.Port
			);

			if (listenerPortMock.messageListeners.length > 0)
				return connectorPortMock as unknown as chrome.runtime.Port;
			else throw new Error('Receiving end does not exist');
		});
	});

	afterEach(() => {
		chrome.runtime.connect.mockReset();
		chrome.runtime.onConnect.clearListeners();
	});

	it('should not connect to one another if the port name does not match', () => {
		const bridge = new ChromeBridgeConnector(
			ChromeBridgeConnection.PANEL_TO_CONTENT
		);
		const listener = new ChromeBridgeListener(
			'WRONG NAME' as ChromeBridgeConnection
		);

		expect(bridge.isConnected).toBe(false);
		expect(listener.isConnected).toBe(false);

		expect(() => bridge.connect()).toThrowError('Receiving end does not exist');

		expect(bridge.isConnected).toBe(false);
		expect(listener.isConnected).toBe(false);
		expect(listenerPortMock.onDisconnect.addListener).not.toBeCalled();
		expect(connectorPortMock.onDisconnect.addListener).not.toBeCalled();
	});

	it('should connect to one another if the port name matches', () => {
		const bridge = new ChromeBridgeConnector(
			ChromeBridgeConnection.PANEL_TO_CONTENT
		);
		const listener = new ChromeBridgeListener(
			ChromeBridgeConnection.PANEL_TO_CONTENT
		);
		listener.onMessage(vi.fn());

		expect(bridge.isConnected).toBe(false);
		expect(listener.isConnected).toBe(false);

		bridge.connect();

		expect(bridge.isConnected).toBe(true);
		expect(listener.isConnected).toBe(true);
		expect(listenerPortMock.onDisconnect.addListener).toBeCalledTimes(1);
		expect(connectorPortMock.onDisconnect.addListener).toBeCalledTimes(1);
	});

	it('should call onConnect callback when connected and reconnected', () => {
		const onConnectCallback = vi.fn();
		const bridge = new ChromeBridgeConnector(
			ChromeBridgeConnection.PANEL_TO_CONTENT
		);
		const listener = new ChromeBridgeListener(
			ChromeBridgeConnection.PANEL_TO_CONTENT,
			onConnectCallback
		);
		listener.onMessage(vi.fn());

		expect(bridge.isConnected).toBe(false);
		expect(listener.isConnected).toBe(false);
		expect(onConnectCallback).not.toBeCalled();

		bridge.connect();

		expect(bridge.isConnected).toBe(true);
		expect(listener.isConnected).toBe(true);
		expect(onConnectCallback).toBeCalledTimes(1);

		bridge.disconnect();
		bridge.connect();

		expect(bridge.isConnected).toBe(true);
		expect(listener.isConnected).toBe(true);
		expect(onConnectCallback).toBeCalledTimes(2);
	});

	it('should allow sending bidirectional messages', () => {
		const bridge = new ChromeBridgeConnector(
			ChromeBridgeConnection.PANEL_TO_CONTENT
		);
		const listener = new ChromeBridgeListener(
			ChromeBridgeConnection.PANEL_TO_CONTENT
		);

		const bridgeMessageCallback = vi.fn();
		const listenerMessageCallback = vi.fn();

		bridge.onMessage(bridgeMessageCallback);
		listener.onMessage(listenerMessageCallback);

		bridge.connect();

		expect(bridgeMessageCallback).not.toBeCalled();
		expect(listenerMessageCallback).not.toBeCalled();

		bridge.send({
			type: ChromeBridgeMessageType.INSPECT_ELEMENT,
			content: [],
		});

		expect(bridgeMessageCallback).not.toBeCalled();
		expect(listenerMessageCallback).toBeCalledTimes(1);

		listener.send({
			type: ChromeBridgeMessageType.INSPECT_ELEMENT,
			content: [],
		});

		expect(bridgeMessageCallback).toBeCalledTimes(1);
		expect(listenerMessageCallback).toBeCalledTimes(1);
	});
});

class PortMock {
	constructor(public name = '') {}
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	messageListeners: ((message: any) => void)[] = [];

	disconnect = vi.fn(() => {
		this.messageListeners = [];
	});

	onDisconnect = {
		addListener: vi.fn(),
	};

	onMessage = {
		addListener: vi.fn((callback) => this.messageListeners.push(callback)),
		removeListener: vi.fn((callback) => {
			this.messageListeners = this.messageListeners.filter(
				(listener) => listener !== callback
			);
		}),
	};

	postMessage = vi.fn((message) => {
		this.messageListeners.forEach((listener) => listener(message));
	});
}
