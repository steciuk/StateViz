/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, it } from 'vitest';
import { exportedForTest } from './inspect-element';
import { DataType } from '@src/shared/types/DataType';
const { parseProps, parseContext, parseHooks, parseState, getNodeState } =
	exportedForTest;

describe('parseProps', () => {
	it('should return null if fiberProps is null', () => {
		const fiber = {
			tag: 1, // WorkTag.FunctionComponent
			memoizedProps: null,
		};

		const result = parseProps(fiber as any);

		expect(result).toBe(null);
	});

	it('should parse and return group data for props', () => {
		const fiber = {
			tag: 1, // WorkTag.FunctionComponent
			memoizedProps: { prop1: 'value1', prop2: 'value2' },
		};

		const result = parseProps(fiber as any);

		expect(result?.data).toEqual([
			{ label: 'prop1', value: { type: DataType.STRING, data: 'value1' } },
			{ label: 'prop2', value: { type: DataType.STRING, data: 'value2' } },
		]);
	});

	it('should parse and return single prop', () => {
		const fiber = {
			tag: 1, // WorkTag.FunctionComponent
			memoizedProps: 'value',
		};

		const result = parseProps(fiber as any);

		expect(result?.data).toEqual([
			{ label: 'value', value: { type: DataType.STRING, data: 'value' } },
		]);
	});
});

describe('parseContext', () => {
	it('should return null if fiber does not have context', () => {
		const fiber = {
			dependencies: null,
		};

		const result = parseContext(fiber as any);

		expect(result).toBe(null);
	});

	it('should filter out contexts without memoizedValue', () => {
		const context2 = {
			memoizedValue: 'context2',
			next: null,
		};
		const context1 = {
			next: context2,
		};
		const fiber = {
			dependencies: {
				firstContext: context1,
			},
		};

		const result = parseContext(fiber as any);
		expect(result?.data).toHaveLength(1);
	});

	it('should parse and return the whole context data without _debugHookTypes', () => {
		const context2 = {
			memoizedValue: 'context2',
			next: null,
		};
		const context1 = {
			memoizedValue: 'context1',
			next: context2,
		};
		const fiber = {
			dependencies: {
				firstContext: context1,
			},
		};

		const result = parseContext(fiber as any);

		expect(result?.data).toEqual([
			{
				label: 'Context',
				value: { type: DataType.STRING, data: 'context1' },
			},
			{
				label: 'Context',
				value: { type: DataType.STRING, data: 'context2' },
			},
		]);
	});

	it('should slice the number of contexts based on _debugHookTypes', () => {
		const context3 = {
			memoizedValue: 'context3',
			next: null,
		};
		const context2 = {
			memoizedValue: 'context2',
			next: context3,
		};
		const context1 = {
			memoizedValue: 'context1',
			next: context2,
		};
		const fiber = {
			dependencies: {
				firstContext: context1,
			},
			_debugHookTypes: ['useContext', 'useContext', 'useState'],
		};

		const result = parseContext(fiber as any);

		expect(result?.data).toEqual([
			{
				label: 'Context',
				value: { type: DataType.STRING, data: 'context1' },
			},
			{
				label: 'Context',
				value: { type: DataType.STRING, data: 'context2' },
			},
		]);
	});
});

describe('parseHooks', () => {
	it('should return an empty data array if memoizedState is null', () => {
		const memoizedState = null;
		const result = parseHooks(memoizedState as any);
		expect(result.data).toEqual([]);
	});

	it('should return an array of objects representing the memoized state', () => {
		const memoizedState = {
			memoizedState: 'state1',
			next: {
				memoizedState: 'state2',
				next: null,
			},
		};
		const result = parseHooks(memoizedState as any);
		expect(result.data).toEqual([
			{
				label: 'unknown',
				value: { type: DataType.STRING, data: 'state1' },
			},
			{
				label: 'unknown',
				value: { type: DataType.STRING, data: 'state2' },
			},
		]);
	});

	it('should filter out "useDebugValue" and "useContext" as labels from the hookTypes array', () => {
		const memoizedState = {
			memoizedState: 'state1',
			next: {
				memoizedState: 'state2',
				next: null,
			},
		};
		const result = parseHooks(memoizedState as any, [
			'useDebugValue',
			'useState',
			'useContext',
		]);

		expect(result?.data).toEqual([
			{
				label: 'useState',
				value: { type: DataType.STRING, data: 'state1' },
			},
			{
				label: 'unknown',
				value: { type: DataType.STRING, data: 'state2' },
			},
		]);
	});

	it('should assign "unknown" label to hooks without corresponding hookTypes', () => {
		const memoizedState = {
			memoizedState: 'state1',
			next: {
				memoizedState: 'state2',
				next: null,
			},
		};
		const result = parseHooks(memoizedState as any, ['useState']);

		expect(result?.data).toEqual([
			{
				label: 'useState',
				value: { type: DataType.STRING, data: 'state1' },
			},
			{
				label: 'unknown',
				value: { type: DataType.STRING, data: 'state2' },
			},
		]);
	});
});

describe('parseState', () => {
	it('should return null if memoizedState is null', () => {
		const memoizedState = null;
		const result = parseState(memoizedState as any);
		expect(result).toBe(null);
	});

	it('should parse and return group data for memoized state', () => {
		const memoizedState = {
			state1: 'value1',
			state2: 'value2',
		};
		const result = parseState(memoizedState as any);
		expect(result?.data).toEqual([
			{
				label: 'state1',
				value: { type: DataType.STRING, data: 'value1' },
			},
			{
				label: 'state2',
				value: { type: DataType.STRING, data: 'value2' },
			},
		]);
	});
});

describe('getNodeState', () => {
	it('should return null if memoizedState is null', () => {
		const fiber = {
			memoizedState: null,
			_debugHookTypes: ['useState'],
		};
		const result = getNodeState(fiber as any);
		expect(result).toBe(null);
	});

	it('should return null if memoizedState is not an object', () => {
		const fiber = {
			memoizedState: 'state',
			_debugHookTypes: ['useState'],
		};
		const result = getNodeState(fiber as any);
		expect(result).toBe(null);
	});
});

