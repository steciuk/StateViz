import { typeData } from '@pages/content/content-main/react/getDataType';
import { DataType, InspectData } from '@src/shared/types/DataType';

const MAX_DEPTH = 5;
export function dehydrate(value: unknown, depth: number = 0): InspectData {
	if (depth > MAX_DEPTH) {
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
			const reactElementType = typedData.data.type;
			if (typeof reactElementType === 'string') {
				return { type: typedData.type, data: reactElementType };
			} else {
				return { type: typedData.type, data: reactElementType.name };
			}
		}
		case DataType.ARRAY: {
			const data: InspectData[] = [];
			for (const a of typedData.data) {
				data.push(dehydrate(a, depth + 1));
			}
			return { type: typedData.type, data };
		}
		// TODO: check if this is what I want
		case DataType.OBJECT:
		case DataType.CLASS_INSTANCE: {
			const data: Record<string, InspectData> = {};
			for (const [key, value] of Object.entries(typedData.data)) {
				data[key] = dehydrate(value, depth + 1);
			}
			return { type: typedData.type, data };
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

