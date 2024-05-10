/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, it } from 'vitest';
import { MAX_DEHYDRATE_DEPTH, dehydrate, exportedForTest } from './dehydrate';
import { DataType } from '@src/shared/types/DataType';
import { createElement } from 'react';
const { typeData } = exportedForTest;

describe('typeData', () => {
	it('should return DataType.NULL if data is null', () => {
		const data = null;
		const result = typeData(data);
		expect(result.type).toBe(DataType.NULL);
	});

	it('should return DataType.UNDEFINED if data is undefined', () => {
		const data = undefined;
		const result = typeData(data);
		expect(result.type).toBe(DataType.UNDEFINED);
	});

	it('should return DataType.HTML_ELEMENT if data is an HTMLElement', () => {
		const data = document.createElement('div');
		const result = typeData(data);
		expect(result.type).toBe(DataType.HTML_ELEMENT);
		expect(result.data).toBe(data);
	});

	it('should return DataType.HTML_ALL_COLLECTION if data is an HTMLCollection', () => {
		const data = document.getElementsByTagName('div');
		const result = typeData(data);
		expect(result.type).toBe(DataType.HTML_ALL_COLLECTION);
		expect(result.data).toBe(data);
	});

	it('should return DataType.BOOLEAN if data is a boolean', () => {
		const data = true;
		const result = typeData(data);
		expect(result.type).toBe(DataType.BOOLEAN);
		expect(result.data).toBe(data);
	});

	it('should return DataType.FUNCTION if data is a function', () => {
		const data = () => {};
		const result = typeData(data);
		expect(result.type).toBe(DataType.FUNCTION);
		expect(result.data).toBe(data);
	});

	it('should return DataType.STRING if data is a string', () => {
		const data = 'hello';
		const result = typeData(data);
		expect(result.type).toBe(DataType.STRING);
		expect(result.data).toBe(data);
	});

	it('should return DataType.SYMBOL if data is a symbol', () => {
		const data = Symbol('symbol');
		const result = typeData(data);
		expect(result.type).toBe(DataType.SYMBOL);
		expect(result.data).toBe(data);
	});

	it('should return DataType.BIGINT if data is a bigint', () => {
		const data = BigInt(10);
		const result = typeData(data);
		expect(result.type).toBe(DataType.BIGINT);
		expect(result.data).toBe(data);
	});

	it('should return DataType.NUMBER if data is a number', () => {
		const data = 42;
		const result = typeData(data);
		expect(result.type).toBe(DataType.NUMBER);
		expect(result.data).toBe(data);
	});

	it('should return DataType.INFINITY if data is Infinity', () => {
		const data = Infinity;
		const result = typeData(data);
		expect(result.type).toBe(DataType.INFINITY);
		expect(result.data).toBe(data);
	});

	it('should return DataType.NAN if data is NaN', () => {
		const data = NaN;
		const result = typeData(data);
		expect(result.type).toBe(DataType.NAN);
		expect(result.data).toBe(data);
	});

	it('should return DataType.REACT_ELEMENT if data is a React element', () => {
		const data = createElement('div');
		const result = typeData(data);
		expect(result.type).toBe(DataType.REACT_ELEMENT);
		expect(result.data).toBe(data);
	});

	it('should return DataType.ARRAY if data is an array', () => {
		const data = [1, 2, 3];
		const result = typeData(data);
		expect(result.type).toBe(DataType.ARRAY);
		expect(result.data).toBe(data);
	});

	it('should return DataType.REGEXP if data is a RegExp', () => {
		const data = /test/;
		const result = typeData(data);
		expect(result.type).toBe(DataType.REGEXP);
		expect(result.data).toBe(data);
	});

	it('should return DataType.DATE if data is a Date', () => {
		const data = new Date();
		const result = typeData(data);
		expect(result.type).toBe(DataType.DATE);
		expect(result.data).toBe(data);
	});

	it('should return DataType.OBJECT if data is a plain object', () => {
		const data = { key: 'value' };
		const result = typeData(data);
		expect(result.type).toBe(DataType.OBJECT);
		expect(result.data).toBe(data);
	});

	it('should return DataType.CLASS_INSTANCE if data is a class instance', () => {
		class MyClass {}
		const data = new MyClass();
		const result = typeData(data);
		expect(result.type).toBe(DataType.CLASS_INSTANCE);
		expect(result.data).toBe(data);
	});

	// TODO: TYPED_ARRAY, ARRAY_BUFFER, DATA_VIEW, ITERATOR, OPAQUE_ITERATOR
});

describe('dehydrate', () => {
	it('should return MAX_DEPTH if depth exceeds the maximum depth', () => {
		const value = 'some value';
		const result = dehydrate(value, MAX_DEHYDRATE_DEPTH + 1);
		expect(result.type).toBe('MAX_DEPTH');
	});

	it('should return DataType.NULL if value is null', () => {
		const value = null;
		const result = dehydrate(value);
		expect(result.type).toBe(DataType.NULL);
	});

	it('should return DataType.UNDEFINED if value is undefined', () => {
		const value = undefined;
		const result = dehydrate(value);
		expect(result.type).toBe(DataType.UNDEFINED);
	});

	it('should return DataType.NAN if value is NaN', () => {
		const value = NaN;
		const result = dehydrate(value);
		expect(result.type).toBe(DataType.NAN);
	});

	it('should return DataType.INFINITY if value is Infinity', () => {
		const value = Infinity;
		const result = dehydrate(value);
		expect(result.type).toBe(DataType.INFINITY);
	});

	it('should return DataType.NUMBER if value is a number', () => {
		const value = 42;
		const result = dehydrate(value);
		expect(result.type).toBe(DataType.NUMBER);
		expect((result as any).data).toBe(value);
	});

	it('should return DataType.BOOLEAN if value is a boolean', () => {
		const value = true;
		const result = dehydrate(value);
		expect(result.type).toBe(DataType.BOOLEAN);
		expect((result as any).data).toBe(value);
	});

	it('should return DataType.STRING if value is a string', () => {
		const value = 'hello';
		const result = dehydrate(value);
		expect(result.type).toBe(DataType.STRING);
		expect((result as any).data).toBe(value);
	});

	it('should return DataType.SYMBOL if value is a symbol', () => {
		const value = Symbol('symbol');
		const result = dehydrate(value);
		expect(result.type).toBe(DataType.SYMBOL);
		expect((result as any).data).toBe(value.toString());
	});

	it('should return DataType.BIGINT if value is a bigint', () => {
		const value = BigInt(10);
		const result = dehydrate(value);
		expect(result.type).toBe(DataType.BIGINT);
		expect((result as any).data).toBe('10');
	});

	it('should return DataType.REGEXP if value is a RegExp', () => {
		const value = /test/;
		const result = dehydrate(value);
		expect(result.type).toBe(DataType.REGEXP);
		expect((result as any).data).toBe('/test/');
	});

	it('should return DataType.DATE if value is a Date', () => {
		const value = new Date();
		const result = dehydrate(value);
		expect(result.type).toBe(DataType.DATE);
		expect((result as any).data).toBe(value.toDateString());
	});

	it('should return DataType.HTML_ELEMENT if value is an HTMLElement', () => {
		const value = document.createElement('div');
		const result = dehydrate(value);
		expect(result.type).toBe(DataType.HTML_ELEMENT);
		expect((result as any).data).toBe(value.tagName);
	});

	it('should return DataType.HTML_ALL_COLLECTION if value is an HTMLCollection', () => {
		const value = document.getElementsByTagName('div');
		const result = dehydrate(value);
		expect(result.type).toBe(DataType.HTML_ALL_COLLECTION);
		expect((result as any).data).toEqual(
			Array.from(value).map((el) => el.tagName)
		);
	});

	it('should return DataType.REACT_ELEMENT if value is a React element', () => {
		const value = createElement('div');
		const result = dehydrate(value);
		expect(result.type).toBe(DataType.REACT_ELEMENT);
		expect((result as any).data).toBe('div');
	});

	it('should return DataType.ARRAY if value is an array', () => {
		const value = [1, 2, 3];
		const result = dehydrate(value);
		expect(result.type).toBe(DataType.ARRAY);
		expect((result as any).data).toEqual(value.map((el) => dehydrate(el)));
	});

	it('should return DataType.OBJECT if value is a plain object', () => {
		const value = { key: 'value' };
		const result = dehydrate(value);
		expect(result.type).toBe(DataType.OBJECT);
		expect((result as any).data).toEqual({
			key: { type: DataType.STRING, data: 'value' },
		});
	});

	it('should return DataType.CLASS_INSTANCE if value is a class instance', () => {
		class MyClass {
			publicProp = 'public';
			protected protectedProp = 'protected';
			private privateProp = 'private';
			public method() {}
		}
		const value = new MyClass();
		const result = dehydrate(value);
		expect(result.type).toBe(DataType.CLASS_INSTANCE);
		expect((result as any).data.className).toBe('MyClass');
		expect((result as any).data.data).toEqual({
			publicProp: { type: DataType.STRING, data: 'public' },
			protectedProp: { type: DataType.STRING, data: 'protected' },
			privateProp: { type: DataType.STRING, data: 'private' },
		});
	});

	it('should return DataType.FUNCTION if value is a function', () => {
		const value = () => {};
		const result = dehydrate(value);
		expect(result.type).toBe(DataType.FUNCTION);
		expect((result as any).data).toBe('ƒ value() {}');
	});

	it('should return properly dehydrated nested objects', () => {
		const value = {
			key: {
				nestedKey: 'nestedValue',
			},
		};
		const result = dehydrate(value);
		expect(result.type).toBe(DataType.OBJECT);
		expect((result as any).data).toEqual({
			key: {
				type: DataType.OBJECT,
				data: {
					nestedKey: {
						type: DataType.STRING,
						data: 'nestedValue',
					},
				},
			},
		});
	});
});

