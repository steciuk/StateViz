import React, { useContext, useEffect, useState } from 'react';

import { ChromeBridgeContext } from '@pages/panel/contexts/ChromeBridgeContext';
import { InspectDataContext } from '@pages/panel/contexts/NodeInspectDataContext';
import { SelectedFiberContext } from '@pages/panel/contexts/SelectedFiberContext';
import { getWorkTagLabel } from '@pages/panel/utils/work-tag';
import {
	ChromeBridgeMessageType,
	NodeInspectedData,
} from '@src/shared/chrome-messages/ChromeBridge';
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
				{nodeInspectData && <p>State: {nodeInspectData.state as string}</p>}
			</div>
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
