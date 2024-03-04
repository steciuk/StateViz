import { ReactElement } from 'react';

import { DataType, TypedData } from '@src/shared/types/DataType';

// Based on react/packages/react-devtools-shared/src/utils.js
export function typeData(data: unknown): TypedData {
	if (data === null) return { type: DataType.NULL, data: data };
	if (data === undefined) return { type: DataType.UNDEFINED, data: data };
	if (data instanceof HTMLElement)
		return { type: DataType.HTML_ELEMENT, data: data };
	if (data instanceof HTMLCollection)
		return { type: DataType.HTML_ALL_COLLECTION, data: data };

	if (typeof data === 'boolean') return { type: DataType.BOOLEAN, data: data };
	if (typeof data === 'function')
		return { type: DataType.FUNCTION, data: data };
	if (typeof data === 'string') return { type: DataType.STRING, data: data };
	if (typeof data === 'symbol') return { type: DataType.SYMBOL, data: data };
	if (typeof data === 'bigint') return { type: DataType.BIGINT, data: data };
	if (typeof data === 'number') {
		if (!Number.isFinite(data)) return { type: DataType.INFINITY, data: data };
		if (Number.isNaN(data)) return { type: DataType.NAN, data: data };
		return { type: DataType.NUMBER, data: data };
	}
	if (typeof data === 'object') {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		if ((data as any)?.$$typeof === Symbol.for('react.element'))
			return { type: DataType.REACT_ELEMENT, data: data as ReactElement };
		if (Array.isArray(data))
			return { type: DataType.ARRAY, data: data as unknown[] };
		// TODO: TYPED_ARRAY
		// TODO: ARRAY_BUFFER
		// TODO: DATA_VIEW
		if (data instanceof RegExp) return { type: DataType.REGEXP, data: data };
		if (data instanceof Date) return { type: DataType.DATE, data: data };
		// TODO: ITERATOR
		// TODO: OPAQUE_ITERATOR
		if (!isPlainObject(data))
			return { type: DataType.CLASS_INSTANCE, data: data };

		return { type: DataType.OBJECT, data: data };
	}

	return { type: DataType.UNKNOWN, data: data };
}

function isPlainObject(value: object) {
	return (
		value &&
		typeof value === 'object' &&
		(value.constructor === Object || value.constructor === undefined)
	);
}
