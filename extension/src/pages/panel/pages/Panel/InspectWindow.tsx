import React, { useContext, useEffect, useState } from 'react';

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
				<p>Name: {selectedFiber.name}</p>
				<p>Tag: {selectedFiber.tag}</p>
				<p>Type: {getWorkTagLabel(selectedFiber.tag)}</p>
				<p>ID: {selectedFiber.id}</p>
				{nodeInspectData && (
					<>
						<p>State:</p>
						{nodeInspectData.state.map((data, index) => (
							<NodeStateInspectViewer key={index} inspectData={data} />
						))}
					</>
				)}
			</div>
		</div>
	);
};

const NodeStateInspectViewer = (props: { inspectData: InspectData }) => {
	const { inspectData } = props;

	switch (inspectData.type) {
		case DataType.NULL:
			return <p>null</p>;
		case DataType.UNDEFINED:
			return <p>undefined</p>;
		case DataType.INFINITY:
			return <p>Infinity</p>;
		case DataType.NAN:
			return <p>NaN</p>;
		case DataType.STRING:
			return <p>{`"${inspectData.data}"`}</p>;
		case DataType.SYMBOL:
		case DataType.REGEXP:
		case DataType.DATE:
		case DataType.HTML_ELEMENT:
		case DataType.FUNCTION:
		case DataType.REACT_ELEMENT:
		case DataType.NUMBER:
		case DataType.BIGINT:
		case DataType.BOOLEAN:
			return <p>{inspectData.data}</p>;
		case DataType.OBJECT:
		case DataType.CLASS_INSTANCE:
			return <p>Object</p>;
		case DataType.ARRAY:
			return <p>Array</p>;
		case DataType.HTML_ALL_COLLECTION:
			return <p>{`[${inspectData.data.join(', ')}]`}</p>;
		case 'MAX_DEPTH':
			return <p>...</p>;
		case DataType.TYPED_ARRAY:
		case DataType.ARRAY_BUFFER:
		case DataType.DATA_VIEW:
		case DataType.ITERATOR:
		case DataType.OPAQUE_ITERATOR:
			return <p>Not yet implemented...</p>;
		case DataType.UNKNOWN:
			return <p>Unknown</p>;

		default:
			return <p>Unknown</p>;
	}
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
