import React, { useContext, useEffect, useState } from 'react';

import { ExpandArrow } from '@pages/panel/components/ExpandArrow';
import { ChromeBridgeContext } from '@pages/panel/contexts/ChromeBridgeContext';
import { InspectDataContext } from '@pages/panel/contexts/NodeInspectDataContext';
import { SelectedFiberContext } from '@pages/panel/contexts/SelectedFiberContext';
import { getWorkTagLabel } from '@pages/panel/utils/work-tag';
import { ChromeBridgeMessageType } from '@src/shared/chrome-messages/ChromeBridge';
import {
	DataType,
	InspectData,
	NodeInspectedData,
} from '@src/shared/types/DataType';
import { NodeId } from '@src/shared/types/ParsedFiber';

export const InspectWindow = (props: { className?: string }) => {
	const selectedFiber = useContext(SelectedFiberContext);
	const nodeInspectData = useInspectNodeData(selectedFiber?.id ?? null);

	if (!selectedFiber) {
		return null;
	}

	return (
		<div className={props.className}>
			<div className="p-2">
				<h2 className="text-lg">Inspect window</h2>
				<span>Name: {selectedFiber.name}</span>
				<span>Tag: {selectedFiber.tag}</span>
				<span>Type: {getWorkTagLabel(selectedFiber.tag)}</span>
				<span>ID: {selectedFiber.id}</span>
				{nodeInspectData && (
					<>
						<p className="font-semibold">State:</p>
						{nodeInspectData.state.map((data, index) => (
							<div key={index} className="border-b-1 border-secondary">
								<NodeStateValue inspectData={data} />
							</div>
						))}
					</>
				)}
			</div>
		</div>
	);
};

const NodeStateValue = (props: { inspectData: InspectData }) => {
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
		case DataType.BOOLEAN:
			return <span>{inspectData.data}</span>;
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
		<div>
			<ExpandArrow
				isExpanded={expanded}
				onClick={(value) => setExpanded(value)}
				disabled={isEmpty}
			/>
			{expanded ? (
				<>
					{inspectData.data.map((value, index) => (
						<p key={index}>
							{index}: <NodeStateValue inspectData={value} />
						</p>
					))}
				</>
			) : (
				<span>{isEmpty ? '[]' : '[...]'}</span>
			)}
		</div>
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

	const isEmpty = Object.keys(inspectData.data).length === 0;

	return (
		<div>
			<ExpandArrow
				isExpanded={expanded}
				onClick={(value) => setExpanded(value)}
				disabled={isEmpty}
			/>
			{expanded ? (
				<>
					{Object.entries(inspectData.data).map(([key, value]) => (
						<p key={key}>
							{key}: <NodeStateValue inspectData={value} />
						</p>
					))}
				</>
			) : (
				<span>{isEmpty ? '{}' : '{...}'}</span>
			)}
		</div>
	);
};

// TODO: Backend is ready to support multiple ids.
// If needed, refactor this
const useInspectNodeData = (nodeId: NodeId | null) => {
	const inspectData = useContext(InspectDataContext);
	const chromeBridge = useContext(ChromeBridgeContext);
	const [nodeInspectData, setNodeInspectData] =
		useState<NodeInspectedData | null>(null);

	const lastInspectedFiberId = React.useRef<NodeId | null>(null);

	useEffect(() => {
		if (nodeId === null) {
			setNodeInspectData(null);
		} else if (inspectData) {
			const nodeInspectData = inspectData.find((data) => data.id === nodeId);
			setNodeInspectData(nodeInspectData?.data ?? null);
		}
	}, [inspectData, nodeId]);

	useEffect(() => {
		if (lastInspectedFiberId.current === nodeId) return;
		lastInspectedFiberId.current = nodeId;

		console.log('Requested', nodeId);
		chromeBridge.send({
			type: ChromeBridgeMessageType.INSPECT_ELEMENT,
			content: nodeId === null ? [] : [nodeId],
		});
	}, [nodeId, chromeBridge]);

	return nodeInspectData;
};
