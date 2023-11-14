import { ParsedFiber } from '@src/shared/types/ParsedFiber';

export enum ChromeBridgeConnection {
	PANEL_TO_CONTENT = 'PANEL_TO_CONTENT_SCRIPT',
}

export enum ChromeBridgeMessageType {
	COMMIT_ROOT = 'COMMIT_ROOT',
	FULL_SKELETON = 'FULL_SKELETON',
}

export type ChromeBridgeMessage = FullSkeletonBridgeMessage;

type FullSkeletonBridgeMessage = {
	type: ChromeBridgeMessageType.FULL_SKELETON;
	content: ParsedFiber;
};

abstract class ChromeBridge {
	protected port?: chrome.runtime.Port;

	constructor(protected connection: ChromeBridgeConnection) {}

	abstract connect(): void;

	get isConnected() {
		return !!this.port;
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
		if (!this.port) {
			throw new Error('Not connected');
		}

		const eventListener = (message: ChromeBridgeMessage) => {
			callback(message);
		};

		this.port.onMessage.addListener(eventListener);

		return () => {
			this.port?.onMessage.removeListener(eventListener);
		};
	}
}

export class ChromeBridgeConnector extends ChromeBridge {
	override connect() {
		if (this.port) {
			throw new Error('Already connected');
		}

		this.port = chrome.runtime.connect({ name: this.connection });
		this.port.onDisconnect.addListener(() => {
			this.port = undefined;
		});
	}
}

export class ChromeBridgeToTabConnector extends ChromeBridge {
	constructor(connection: ChromeBridgeConnection, private tabId: number) {
		super(connection);
	}

	override connect() {
		if (this.port) {
			throw new Error('Already connected');
		}

		this.port = chrome.tabs.connect(this.tabId, { name: this.connection });
		this.port.onDisconnect.addListener(() => {
			this.port = undefined;
		});
	}
}

export class ChromeBridgeListener extends ChromeBridge {
	private listeners: Array<(message: ChromeBridgeMessage) => void> = [];

	override connect(onConnect?: () => void): void {
		if (this.port) {
			throw new Error('Already connected');
		}

		chrome.runtime.onConnect.addListener((port) => {
			if (port.name !== this.connection) return;

			this.port = port;
			this.port.onDisconnect.addListener(() => {
				this.port = undefined;
			});
			this.listeners.forEach((listener) =>
				port.onMessage.addListener(listener)
			);
			onConnect?.();
		});
	}

	override onMessage(
		callback: (message: FullSkeletonBridgeMessage) => void
	): () => void {
		if (this.port) {
			return super.onMessage(callback);
		} else {
			this.listeners.push(callback);

			return () => {
				this.port?.onMessage.removeListener(callback);
				this.listeners = this.listeners.filter(
					(listener) => listener !== callback
				);
			};
		}
	}
}
