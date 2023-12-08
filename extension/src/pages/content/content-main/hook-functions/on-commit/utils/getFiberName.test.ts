import { describe, expect, it } from 'vitest';

import { Fiber } from '@pages/content/content-main/react-types';

import { getFiberName } from './getFiberName';

describe('getFiberName', () => {
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
