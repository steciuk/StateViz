import { LISTENERS } from '@pages/content/content-main/hook-storage/hook-storage';
import { Handler } from '@pages/content/content-main/react-types';

/**
 * Registers a listener for a specific event.
 * @param event - The event name.
 * @param listener - The listener function.
 * */
export function on(event: string, listener: Handler): void {
	// console.log('on', event, listener);
	LISTENERS.add(event, listener);
}
/**
 * Removes a listener
 * @param event - The event name.
 * @param listener - The listener function to remove.
 */
export function off(event: string, listener: Handler): void {
	// console.log('off', event, listener);
	LISTENERS.remove(event, listener);
}

/**
 * Registers a listener for a specific event and returns a function to remove it.
 * @param event - The event name.
 * @param listener - The listener function.
 * @returns A function to remove the listener.
 */
export function sub(event: string, listener: Handler): () => void {
	// console.log('sub', event, listener);
	on(event, listener);
	return () => off(event, listener);
}

export function emit(event: string, data: unknown) {
	// console.log('emit', event, data);
	LISTENERS.emit(event, data);
}
