import { describe, expect, it } from 'vitest';

import { Fiber } from '@pages/content/content-main/react/react-types';

import { getFiberName } from './getFiberName';
import { WorkTag } from '@src/shared/types/react-types';

describe('extractNameFromType', () => {
	it('should return the correct fiber name for different types', () => {
		// Test case 1: string type
		const fiber1 = { type: 'div' } as Fiber;
		expect(getFiberName(fiber1)).toBe('div');

		// Test case 2: function type
		const fiber2 = { type: () => {} } as unknown as Fiber;
		expect(getFiberName(fiber2)).toBe('type');

		// Test case 3: symbol type
		const fiber3 = { type: Symbol('symbol') } as unknown as Fiber;
		expect(getFiberName(fiber3)).toBe('Symbol(symbol)');

		// Test case 4: unknown type
		const fiber4 = { type: null } as Fiber;
		expect(getFiberName(fiber4)).toBe('Unknown');
	});
});

describe('getFiberName', () => {
	it('should return the correct fiber name for different tags', () => {
		// Test case 1: HostComponent tag
		const fiber1 = { type: 'div', tag: WorkTag.HostComponent } as Fiber;
		expect(getFiberName(fiber1)).toBe('<div>');

		// Test case 2: HostRoot tag
		const fiber2 = { type: 'div', tag: WorkTag.HostRoot } as Fiber;
		expect(getFiberName(fiber2)).toBe('HostRoot');

		// Test case 3: HostText tag with string props
		const fiber3 = {
			type: 'div',
			tag: WorkTag.HostText,
			memoizedProps: 'text',
		} as Fiber;
		expect(getFiberName(fiber3)).toBe('"text"');

		// Test case 4: HostText tag with empty string props
		const fiber4 = {
			type: 'div',
			tag: WorkTag.HostText,
			memoizedProps: '',
		} as Fiber;
		expect(getFiberName(fiber4)).toBe('HostText');

		// Test case 5: Fragment tag
		const fiber5 = { type: 'div', tag: WorkTag.Fragment } as Fiber;
		expect(getFiberName(fiber5)).toBe('<>');

		// Test case 6: ContextProvider tag
		const fiber6 = { type: 'div', tag: WorkTag.ContextProvider } as Fiber;
		expect(getFiberName(fiber6)).toBe('Context.Provider');

		// Test case 7: ContextConsumer tag
		const fiber7 = { type: 'div', tag: WorkTag.ContextConsumer } as Fiber;
		expect(getFiberName(fiber7)).toBe('Context.Consumer');
	});
});

