import { NodeInspectedData } from '@src/shared/types/DataType';
import {
	NodeId,
	ParsedNode,
	NodeAndLibrary,
} from '@src/shared/types/ParsedNode';

export enum ChromeBridgeConnection {
	PANEL_TO_CONTENT = 'PANEL_TO_CONTENT_SCRIPT',
}

export enum ChromeBridgeMessageType {
	FULL_SKELETON = 'FULL_SKELETON',
	INSPECT_ELEMENT = 'INSPECT_ELEMENT',
	INSPECTED_DATA = 'INSPECTED_DATA',
}

export type ChromeBridgeMessage =
	| FullSkeletonBridgeMessage
	| InspectElementBridgeMessage
	| InspectedDataBridgeMessage;

export type FullSkeletonBridgeMessage = {
	type: ChromeBridgeMessageType.FULL_SKELETON;
	content: NodeAndLibrary[];
};

export type InspectElementBridgeMessage = {
	type: ChromeBridgeMessageType.INSPECT_ELEMENT;
	content: NodeId[];
};

export type InspectedDataMessageContent = NodeInspectedData[];

export type InspectedDataBridgeMessage = {
	type: ChromeBridgeMessageType.INSPECTED_DATA;
	content: InspectedDataMessageContent;
};

abstract class ChromeBridge {
	protected port?: chrome.runtime.Port;
	protected pendingListeners: Array<(message: ChromeBridgeMessage) => void> =
		[];

	constructor(protected connection: ChromeBridgeConnection) {}

	protected abstract establishConnection(): chrome.runtime.Port | null;

	get isConnected() {
		return !!this.port;
	}

	connect(): void {
		if (this.port) {
			throw new Error('Already connected');
		}

		const port = this.establishConnection();
		if (port) {
			this.port = port;
			this.port.onDisconnect.addListener(() => {
				this.port = undefined;
			});
			this.registerListeners();
		}
	}

	disconnect() {
		if (!this.port) return;

		this.port.disconnect();
		this.port = undefined;
	}

	send(message: ChromeBridgeMessage) {
		if (!this.port) {
			throw new Error('Not connected');
		}

		this.port.postMessage(message);
	}

	onMessage(callback: (message: ChromeBridgeMessage) => void): () => void {
		if (this.port) {
			this.port.onMessage.addListener(callback);
		}

		this.pendingListeners.push(callback);

		return () => {
			this.port?.onMessage.removeListener(callback);
			this.pendingListeners = this.pendingListeners.filter(
				(listener) => listener !== callback
			);
		};
	}

	protected registerListeners() {
		this.pendingListeners.forEach(
			(listener) => this.port?.onMessage.addListener(listener)
		);
	}
}

export class ChromeBridgeConnector extends ChromeBridge {
	protected establishConnection() {
		return chrome.runtime.connect({ name: this.connection });
	}
}

export class ChromeBridgeToTabConnector extends ChromeBridge {
	constructor(
		connection: ChromeBridgeConnection,
		private tabId: number
	) {
		super(connection);
	}

	protected establishConnection() {
		return chrome.tabs.connect(this.tabId, { name: this.connection });
	}
}

export class ChromeBridgeListener extends ChromeBridge {
	constructor(connection: ChromeBridgeConnection, onConnect?: () => void) {
		super(connection);

		chrome.runtime.onConnect.addListener((port) => {
			if (port.name !== this.connection) return;
			this.port = port;
			this.port.onDisconnect.addListener(() => {
				this.port = undefined;
			});
			this.registerListeners();
			onConnect?.();
		});
	}

	protected establishConnection() {
		return null;
	}
}

