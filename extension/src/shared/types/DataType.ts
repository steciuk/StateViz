import { ReactElement } from 'react';

/* eslint-disable no-mixed-spaces-and-tabs */

// Based on react/packages/react-devtools-shared/src/utils.js
export enum DataType {
	NULL = 'NULL',
	UNDEFINED = 'UNDEFINED',
	HTML_ELEMENT = 'HTML_ELEMENT',
	HTML_ALL_COLLECTION = 'HTML_ALL_COLLECTION',
	BOOLEAN = 'BOOLEAN',
	FUNCTION = 'FUNCTION',
	STRING = 'STRING',
	SYMBOL = 'SYMBOL',
	BIGINT = 'BIGINT',
	INFINITY = 'INFINITY',
	NAN = 'NAN',
	NUMBER = 'NUMBER',
	REACT_ELEMENT = 'REACT_ELEMENT',
	ARRAY = 'ARRAY',
	TYPED_ARRAY = 'TYPED_ARRAY', // TODO:
	ARRAY_BUFFER = 'ARRAY_BUFFER', // TODO:
	DATA_VIEW = 'DATA_VIEW', // TODO:
	REGEXP = 'REGEXP',
	DATE = 'DATE',
	ITERATOR = 'ITERATOR', // TODO:
	OPAQUE_ITERATOR = 'OPAQUE_ITERATOR', // TODO:
	CLASS_INSTANCE = 'CLASS_INSTANCE',
	OBJECT = 'OBJECT',
	UNKNOWN = 'UNKNOWN',
}

type TypesWithoutData =
	| DataType.NULL
	| DataType.UNDEFINED
	| DataType.INFINITY
	| DataType.NAN;
type TypesWithStringData =
	| DataType.STRING
	| DataType.SYMBOL
	| DataType.REGEXP
	| DataType.DATE
	| DataType.HTML_ELEMENT
	| DataType.FUNCTION
	| DataType.REACT_ELEMENT
	| DataType.BIGINT;
type TypeToImplement =
	| DataType.TYPED_ARRAY
	| DataType.ARRAY_BUFFER
	| DataType.DATA_VIEW
	| DataType.ITERATOR
	| DataType.OPAQUE_ITERATOR
	| DataType.UNKNOWN;

export type TypedData =
	| {
			type: DataType.NULL;
			data: null;
	  }
	| {
			type: DataType.UNDEFINED;
			data: undefined;
	  }
	| {
			type: DataType.HTML_ELEMENT;
			data: HTMLElement;
	  }
	| {
			type: DataType.REACT_ELEMENT;
			data: ReactElement;
	  }
	| {
			type: DataType.HTML_ALL_COLLECTION;
			data: HTMLCollection;
	  }
	| {
			type: DataType.BOOLEAN;
			data: boolean;
	  }
	| {
			type: DataType.FUNCTION;
			// eslint-disable-next-line @typescript-eslint/ban-types
			data: Function;
	  }
	| {
			type: DataType.STRING;
			data: string;
	  }
	| {
			type: DataType.SYMBOL;
			data: symbol;
	  }
	| {
			type: DataType.BIGINT;
			data: bigint;
	  }
	| {
			type: DataType.INFINITY | DataType.NAN | DataType.NUMBER;
			data: number;
	  }
	| {
			type: DataType.ARRAY;
			data: unknown[];
	  }
	| {
			type: DataType.REGEXP;
			data: RegExp;
	  }
	| {
			type: DataType.DATE;
			data: Date;
	  }
	| {
			type: DataType.CLASS_INSTANCE | DataType.OBJECT;
			data: object;
	  }
	| {
			type: TypeToImplement;
			data: unknown;
	  };

export type InspectData =
	| {
			type: TypesWithoutData;
	  }
	| {
			type: TypesWithStringData;
			data: string;
	  }
	| {
			type: DataType.HTML_ALL_COLLECTION;
			data: string[];
	  }
	| {
			type: DataType.NUMBER;
			data: number;
	  }
	| {
			type: DataType.BOOLEAN;
			data: boolean;
	  }
	| {
			type: DataType.ARRAY;
			data: InspectData[];
	  }
	| {
			type: DataType.OBJECT;
			data: {
				[key: string]: InspectData;
			};
	  }
	| {
			type: DataType.CLASS_INSTANCE;
			data: {
				className: string;
				data: {
					[key: string]: InspectData;
				};
			};
	  }
	| {
			type: TypeToImplement;
	  }
	| {
			type: 'MAX_DEPTH';
	  };

