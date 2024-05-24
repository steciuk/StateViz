import { extractNameFromType } from '@pages/content/content-main/react/utils/getFiberName';
import { DataType, InspectData, TypedData } from '@src/shared/types/DataType';

export const MAX_DEHYDRATE_DEPTH = 5;
export function dehydrate(value: unknown, depth: number = 0): InspectData {
	if (depth > MAX_DEHYDRATE_DEPTH) {
		return { type: 'MAX_DEPTH' };
	}

	const typedData = typeData(value);

	switch (typedData.type) {
		case DataType.NULL:
		case DataType.UNDEFINED:
		case DataType.NAN:
		case DataType.INFINITY:
			return { type: typedData.type };
		case DataType.NUMBER:
		case DataType.BOOLEAN:
		case DataType.STRING:
			return { type: typedData.type, data: typedData.data } as InspectData; // TODO: why is this needed?
		case DataType.SYMBOL:
		case DataType.BIGINT:
		case DataType.REGEXP:
			return { type: typedData.type, data: typedData.data.toString() };
		case DataType.DATE:
			return { type: typedData.type, data: typedData.data.toDateString() };
		// TODO: maybe consider sending more data about HTML elements
		case DataType.HTML_ELEMENT:
			return { type: typedData.type, data: typedData.data.tagName };
		case DataType.HTML_ALL_COLLECTION: {
			const data: string[] = [];
			for (const a of typedData.data) {
				data.push(a.tagName);
			}
			return { type: typedData.type, data };
		}
		case DataType.REACT_ELEMENT: {
			const name = extractNameFromType(typedData.data.type);
			return { type: typedData.type, data: name };
		}
		case DataType.ARRAY: {
			const data: InspectData[] = [];
			for (const a of typedData.data) {
				data.push(dehydrate(a, depth + 1));
			}
			return { type: typedData.type, data };
		}
		// TODO: check if this is what I want
		case DataType.OBJECT: {
			const data: Record<string, InspectData> = {};
			for (const [key, value] of Object.entries(typedData.data)) {
				data[key] = dehydrate(value, depth + 1);
			}
			return { type: typedData.type, data };
		}
		case DataType.CLASS_INSTANCE: {
			const className = typedData.data.constructor.name;
			const data: Record<string, InspectData> = {};
			for (const [key, value] of Object.entries(typedData.data)) {
				data[key] = dehydrate(value, depth + 1);
			}
			return { type: typedData.type, data: { className, data } };
		}
		case DataType.FUNCTION: {
			const func = typedData.data;
			return {
				type: typedData.type,
				data: `ƒ ${typeof func.name === 'function' ? '' : func.name}() {}`,
			};
		}

		// TODO: implement
		case DataType.TYPED_ARRAY:
		case DataType.ARRAY_BUFFER:
		case DataType.DATA_VIEW:
		case DataType.ITERATOR:
		case DataType.OPAQUE_ITERATOR:
			return { type: typedData.type };

		// UNKNOWN
		default:
			return { type: typedData.type };
	}
}

// Based on react/packages/react-devtools-shared/src/utils.js
function typeData(data: unknown): TypedData {
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
		if (Number.isNaN(data)) return { type: DataType.NAN, data: data };
		if (!Number.isFinite(data)) return { type: DataType.INFINITY, data: data };
		return { type: DataType.NUMBER, data: data };
	}
	if (typeof data === 'object') {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		if ((data as any)?.$$typeof === Symbol.for('react.element'))
			return { type: DataType.REACT_ELEMENT, data: data as { type: unknown } };
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

export const exportedForTest = {
	typeData,
};

