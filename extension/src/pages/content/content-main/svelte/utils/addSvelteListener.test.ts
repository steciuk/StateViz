/* eslint-disable @typescript-eslint/no-explicit-any */
import { addSvelteListener } from '@pages/content/content-main/svelte/utils/addSvelteListener';
import { describe, expect, it, vi } from 'vitest';

describe('addSvelteListener', () => {
	it('should add an event listener', () => {
		const listener = vi.fn();
		addSvelteListener('test' as any, listener);
		window.dispatchEvent(new CustomEvent('test'));
		expect(listener).toHaveBeenCalled();
	});

	it('should remove the event listener', () => {
		const listener = vi.fn();
		const removeListener = addSvelteListener('test' as any, listener);
		removeListener();
		window.dispatchEvent(new CustomEvent('test'));
		expect(listener).not.toHaveBeenCalled();
	});
});

