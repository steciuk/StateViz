import { Handler } from '@pages/content/content-main/react-types';

export class ListenersStorage {
	private listeners: Record<string, Handler[]> = {};

	public add(event: string, listener: Handler): void {
		const listeners: Handler[] | undefined = this.listeners[event];
		if (listeners) {
			listeners.push(listener);
		} else {
			this.listeners[event] = [listener];
		}
	}

	public remove(event: string, listener: Handler): void {
		const listeners: Handler[] | undefined = this.listeners[event];
		if (listeners) {
			const index = listeners.indexOf(listener);
			if (index !== -1) {
				listeners.splice(index, 1);
			}

			// TODO: analyze if necessary
			if (listeners.length === 0) {
				delete this.listeners[event];
			}
		}
	}

	public emit(event: string, data: unknown) {
		const listeners: Handler[] | undefined = this.listeners[event];
		if (listeners) {
			listeners.forEach((listener) => listener(data));
		}
	}

	public expose(): Record<string, Handler[]> {
		return this.listeners;
	}
}
