import { NodeInspectedData } from '@src/shared/types/NodeInspectedData';
import { NodeId, NodeAndLibrary } from '@src/shared/types/ParsedNode';

export enum ChromeBridgeConnection {
	PANEL_TO_CONTENT = 'PANEL_TO_CONTENT_SCRIPT',
}

export enum ChromeBridgeMessageType {
	FULL_SKELETON = 'FULL_SKELETON',
	INSPECT_ELEMENT = 'INSPECT_ELEMENT',
	INSPECTED_DATA = 'INSPECTED_DATA',
	HOVER_ELEMENT = 'HOVER_ELEMENT',
}

export type ChromeBridgeMessage =
	| FullSkeletonBridgeMessage
	| InspectElementBridgeMessage
	| InspectedDataBridgeMessage
	| HoverElementBridgeMessage;

export type FullSkeletonBridgeMessage = {
	type: ChromeBridgeMessageType.FULL_SKELETON;
	content: NodeAndLibrary[];
};

export type InspectElementBridgeMessage = {
	type: ChromeBridgeMessageType.INSPECT_ELEMENT;
	content: NodeId[];
};

export type InspectedDataBridgeMessage = {
	type: ChromeBridgeMessageType.INSPECTED_DATA;
	content: NodeInspectedData[];
};

export type HoverElementBridgeMessage = {
	type: ChromeBridgeMessageType.HOVER_ELEMENT;
	content: NodeId;
};

// TODO: https://developer.chrome.com/blog/bfcache-extension-messaging-changes
// handle the case of BF caching
abstract class ChromeBridge {
	protected port?: chrome.runtime.Port;
	protected listeners: Array<(message: ChromeBridgeMessage) => void> = [];

	constructor(protected readonly connectionName: ChromeBridgeConnection) {}

	get isConnected(): boolean {
		return !!this.port;
	}

	disconnect(): void {
		if (!this.port) return;

		this.port.disconnect();
		this.port = undefined;
	}

	send(message: ChromeBridgeMessage): void {
		if (!this.port) {
			throw new Error('Not connected');
		}

		this.port.postMessage(message);
	}

	onMessage = (callback: (message: ChromeBridgeMessage) => void) => {
		if (this.port) {
			this.port.onMessage.addListener(callback);
		}

		this.listeners.push(callback);

		return () => {
			this.port?.onMessage.removeListener(callback);
			this.listeners = this.listeners.filter(
				(listener) => listener !== callback
			);
		};
	};

	protected handleConnection(port: chrome.runtime.Port): void {
		this.port = port;
		port.onDisconnect.addListener(() => {
			this.port = undefined;
		});
		this.registerListeners(port);
	}

	private registerListeners(port: chrome.runtime.Port): void {
		this.listeners.forEach((listener) => port.onMessage.addListener(listener));
	}
}

abstract class ChromeBridgeConnector extends ChromeBridge {
	protected abstract establishConnection(): chrome.runtime.Port;

	connect(): void {
		if (this.port) {
			throw new Error('Already connected');
		}

		const port = this.establishConnection();
		this.handleConnection(port);
	}
}

export class ChromeBridgeToRuntimeConnector extends ChromeBridgeConnector {
	protected override establishConnection() {
		return chrome.runtime.connect({ name: this.connectionName });
	}
}

export class ChromeBridgeToTabConnector extends ChromeBridgeConnector {
	constructor(
		connection: ChromeBridgeConnection,
		private readonly tabId: number
	) {
		super(connection);
	}

	protected override establishConnection() {
		return chrome.tabs.connect(this.tabId, { name: this.connectionName });
	}
}

export class ChromeBridgeListener extends ChromeBridge {
	constructor(
		connection: ChromeBridgeConnection,
		private readonly onConnect?: () => void
	) {
		super(connection);
		this.listen();
	}

	private listen(): void {
		chrome.runtime.onConnect.addListener((port) => {
			if (port.name !== this.connectionName) {
				port.disconnect();
				console.error('Invalid connection');
				return;
			}

			this.handleConnection(port);
			this.onConnect?.();
		});
	}
}

