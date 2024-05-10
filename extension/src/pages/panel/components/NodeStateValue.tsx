import { ExpandArrow } from '@pages/panel/components/ExpandArrow';
import { DataType, InspectData } from '@src/shared/types/DataType';
import { useState } from 'react';

export const NodeStateValue = (props: { inspectData: InspectData }) => {
	const { inspectData } = props;

	switch (inspectData.type) {
		case DataType.NULL:
			return <span>null</span>;
		case DataType.UNDEFINED:
			return <span>undefined</span>;
		case DataType.INFINITY:
			return <span>Infinity</span>;
		case DataType.NAN:
			return <span>NaN</span>;
		case DataType.STRING:
			return <span>{`"${inspectData.data}"`}</span>;
		case DataType.SYMBOL:
		case DataType.REGEXP:
		case DataType.DATE:
		case DataType.HTML_ELEMENT:
		case DataType.FUNCTION:
		case DataType.REACT_ELEMENT:
		case DataType.NUMBER:
		case DataType.BIGINT:
			return <span>{inspectData.data}</span>;
		case DataType.BOOLEAN:
			return <span>{inspectData.data ? 'true' : 'false'}</span>;
		case DataType.OBJECT:
		case DataType.CLASS_INSTANCE:
			return <NodeStateObjectValue inspectData={inspectData} />;
		case DataType.ARRAY:
			return <NodeStateArrayValue inspectData={inspectData} />;
		case DataType.HTML_ALL_COLLECTION:
			return <span>{`[${inspectData.data.join(', ')}]`}</span>;
		case 'MAX_DEPTH':
			return <span>...</span>;
		case DataType.TYPED_ARRAY:
		case DataType.ARRAY_BUFFER:
		case DataType.DATA_VIEW:
		case DataType.ITERATOR:
		case DataType.OPAQUE_ITERATOR:
			return <span>Not yet implemented...</span>;
		case DataType.UNKNOWN:
			return <span>Unknown</span>;

		default:
			return <span>Unknown</span>;
	}
};

const NodeStateArrayValue = (props: {
	inspectData: Extract<InspectData, { type: DataType.ARRAY }>;
}) => {
	const { inspectData } = props;
	const [expanded, setExpanded] = useState<boolean>(false);

	const isEmpty = inspectData.data.length === 0;

	return (
		<span>
			<ExpandArrow
				isExpanded={expanded}
				onClick={(value) => setExpanded(value)}
				disabled={isEmpty}
			/>
			{expanded ? (
				<>
					{inspectData.data.map((value, index) => (
						<p key={index} className="ml-4">
							{index}: <NodeStateValue inspectData={value} />
						</p>
					))}
				</>
			) : (
				<span>{isEmpty ? '[]' : '[...]'}</span>
			)}
		</span>
	);
};

const NodeStateObjectValue = (props: {
	inspectData: Extract<
		InspectData,
		{ type: DataType.OBJECT | DataType.CLASS_INSTANCE }
	>;
}) => {
	const { inspectData } = props;
	const [expanded, setExpanded] = useState<boolean>(false);

	const data =
		inspectData.type === DataType.CLASS_INSTANCE
			? inspectData.data.data
			: inspectData.data;
	const className =
		inspectData.type === DataType.CLASS_INSTANCE
			? inspectData.data.className
			: null;

	const isEmpty = Object.keys(data).length === 0;

	return (
		<span>
			<ExpandArrow
				isExpanded={expanded}
				onClick={(value) => setExpanded(value)}
				disabled={isEmpty}
			/>
			{/* TODO: check if className is displayed correctly */}
			{className && <span>{className}</span>}
			{expanded ? (
				<>
					{Object.entries(data).map(([key, value]) => (
						<p key={key} className="ml-4">
							{key}: <NodeStateValue inspectData={value} />
						</p>
					))}
				</>
			) : (
				<span>{isEmpty ? '{}' : '{...}'}</span>
			)}
		</span>
	);
};

