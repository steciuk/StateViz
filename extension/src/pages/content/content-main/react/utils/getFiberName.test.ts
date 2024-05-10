import { describe, expect, it } from 'vitest';

import { Fiber } from '@pages/content/content-main/react/react-types';

import { getFiberName, isForwardRef, exportedForTest } from './getFiberName';
import { WorkTag } from '@src/shared/types/react-types';
const { getForwardRefName } = exportedForTest;

describe('extractNameFromType', () => {
	it('should return the correct fiber name when type is a string', () => {
		const fiber = { type: 'div' } as Fiber;
		expect(getFiberName(fiber)).toBe('div');
	});

	it('should return the correct fiber name when type is a function', () => {
		const fiber = { type: () => {} } as unknown as Fiber;
		expect(getFiberName(fiber)).toBe('type');
	});

	it('should return the correct fiber name when type is a symbol', () => {
		const fiber = { type: Symbol('symbol') } as unknown as Fiber;
		expect(getFiberName(fiber)).toBe('Symbol(symbol)');
	});

	it('should return the correct fiber name when type is a forward ref', () => {
		const fiber = {
			type: {
				$$typeof: Symbol.for('react.forward_ref'),
				displayName: 'displayName',
				render: () => {},
			},
		} as unknown as Fiber;
		expect(getFiberName(fiber)).toBe('ForwardRef(displayName)');
	});

	it('should return the correct fiber name when type is null', () => {
		const fiber = { type: null } as Fiber;
		expect(getFiberName(fiber)).toBe('Unknown');
	});
});

describe('getFiberName', () => {
	it('should return the correct fiber name for HostComponent tag', () => {
		const fiber = { type: 'div', tag: WorkTag.HostComponent } as Fiber;
		expect(getFiberName(fiber)).toBe('<div>');
	});

	it('should return the correct fiber name for HostRoot tag', () => {
		const fiber = { type: 'div', tag: WorkTag.HostRoot } as Fiber;
		expect(getFiberName(fiber)).toBe('HostRoot');
	});

	it('should return the correct fiber name for HostText tag with string props', () => {
		const fiber = {
			type: 'div',
			tag: WorkTag.HostText,
			memoizedProps: 'text',
		} as Fiber;
		expect(getFiberName(fiber)).toBe('"text"');
	});

	it('should return the correct fiber name for HostText tag with empty string props', () => {
		const fiber = {
			type: 'div',
			tag: WorkTag.HostText,
			memoizedProps: '',
		} as Fiber;
		expect(getFiberName(fiber)).toBe('HostText');
	});

	it('should return the correct fiber name for Fragment tag', () => {
		const fiber = { type: 'div', tag: WorkTag.Fragment } as Fiber;
		expect(getFiberName(fiber)).toBe('<>');
	});

	it('should return the correct fiber name for ContextProvider tag', () => {
		const fiber = { type: 'div', tag: WorkTag.ContextProvider } as Fiber;
		expect(getFiberName(fiber)).toBe('Context.Provider');
	});

	it('should return the correct fiber name for ContextConsumer tag', () => {
		const fiber = { type: 'div', tag: WorkTag.ContextConsumer } as Fiber;
		expect(getFiberName(fiber)).toBe('Context.Consumer');
	});
});

describe('isForwardRef', () => {
	it('should return true for a valid forward ref object', () => {
		const forwardRef = {
			$$typeof: Symbol.for('react.forward_ref'),
			displayName: 'MyComponent',
			render: () => {},
		};
		expect(isForwardRef(forwardRef)).toBe(true);
	});

	it('should return false for null', () => {
		expect(isForwardRef(null)).toBe(false);
	});

	it('should return false for undefined', () => {
		expect(isForwardRef(undefined)).toBe(false);
	});

	it('should return false for an object without $$typeof property', () => {
		const obj = {
			displayName: 'MyComponent',
			render: () => {},
		};
		expect(isForwardRef(obj)).toBe(false);
	});

	it('should return false for an object with $$typeof property that is not a symbol', () => {
		const obj = {
			$$typeof: 'react.forward_ref',
			displayName: 'MyComponent',
			render: () => {},
		};
		expect(isForwardRef(obj)).toBe(false);
	});

	it('should return false for an object with $$typeof property that is not Symbol.for("react.forward_ref")', () => {
		const obj = {
			$$typeof: Symbol.for('react.memo'),
			displayName: 'MyComponent',
			render: () => {},
		};
		expect(isForwardRef(obj)).toBe(false);
	});
});

describe('getForwardRefName', () => {
	it('should return "Unknown" when displayName and render name are empty', () => {
		const ref = {
			displayName: '',
			render: (() => {
				return () => {};
			})(),
		};
		expect(getForwardRefName(ref)).toBe('ForwardRef(Unknown)');
	});

	it('should return the displayName when it is a non-empty string', () => {
		const ref = {
			displayName: 'MyComponent',
			render: () => {},
		};
		expect(getForwardRefName(ref)).toBe('ForwardRef(MyComponent)');
	});

	it('should return the render name when displayName is empty and render name is a non-empty string', () => {
		const ref = {
			displayName: '',
			render: function MyComponent() {},
		};
		expect(getForwardRefName(ref)).toBe('ForwardRef(MyComponent)');
	});
});

