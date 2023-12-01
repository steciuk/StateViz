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
	content: ParsedFiber[];
};

abstract class ChromeBridge {
	protected port?: chrome.runtime.Port;
	protected pendingListeners: Array<(message: ChromeBridgeMessage) => void> =
		[];

	constructor(protected connection: ChromeBridgeConnection) {}

	protected abstract establishConnection():
		| chrome.runtime.Port
		| Promise<chrome.runtime.Port>;

	get isConnected() {
		return !!this.port;
	}

	connect(onConnect?: () => void): void {
		if (this.port) {
			throw new Error('Already connected');
		}

		const port = this.establishConnection();
		if (port instanceof Promise) {
			port.then((port) => {
				this.port = port;
				this.port.onDisconnect.addListener(() => {
					this.port = undefined;
				});
				this.flushPendingListeners();
				onConnect?.();
			});
		} else {
			this.port = port;
			this.port.onDisconnect.addListener(() => {
				this.port = undefined;
			});
			this.flushPendingListeners();
			onConnect?.();
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

	onMessage(
		callback: (message: FullSkeletonBridgeMessage) => void
	): () => void {
		if (this.port) {
			this.port.onMessage.addListener(callback);

			return () => {
				this.port?.onMessage.removeListener(callback);
			};
		} else {
			this.pendingListeners.push(callback);

			return () => {
				this.port?.onMessage.removeListener(callback);
				this.pendingListeners = this.pendingListeners.filter(
					(listener) => listener !== callback
				);
			};
		}
	}

	protected flushPendingListeners() {
		this.pendingListeners.forEach((listener) =>
			this.port?.onMessage.addListener(listener)
		);
		this.pendingListeners = [];
	}
}

export class ChromeBridgeConnector extends ChromeBridge {
	protected establishConnection():
		| chrome.runtime.Port
		| Promise<chrome.runtime.Port> {
		return chrome.runtime.connect({ name: this.connection });
	}
}

export class ChromeBridgeToTabConnector extends ChromeBridge {
	constructor(connection: ChromeBridgeConnection, private tabId: number) {
		super(connection);
	}

	protected establishConnection():
		| chrome.runtime.Port
		| Promise<chrome.runtime.Port> {
		return chrome.tabs.connect(this.tabId, { name: this.connection });
	}
}

export class ChromeBridgeListener extends ChromeBridge {
	protected establishConnection():
		| chrome.runtime.Port
		| Promise<chrome.runtime.Port> {
		return new Promise((resolve) => {
			chrome.runtime.onConnect.addListener((port) => {
				if (port.name !== this.connection) return;
				resolve(port);
			});
		});
	}
}
