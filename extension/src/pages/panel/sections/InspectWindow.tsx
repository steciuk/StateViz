import React, { useContext, useEffect, useState } from 'react';

import { ChromeBridgeContext } from '@pages/panel/contexts/ChromeBridgeContext';
import { InspectDataContext } from '@pages/panel/contexts/NodeInspectDataContext';
import { SelectedNodeContext } from '@pages/panel/contexts/SelectedNodeContext';
import { ChromeBridgeMessageType } from '@src/shared/chrome-messages/ChromeBridge';
import { NodeInspectedData } from '@src/shared/types/NodeInspectedData';
import { NodeId } from '@src/shared/types/ParsedNode';
import NodeInspectInfo from '@pages/panel/components/NodeInspectInfo';
import NodeInspectData from '@pages/panel/components/NodeInspectData';
import { usePrevious } from '@src/shared/hooks/usePrevious';

export const InspectWindow = (props: { className?: string }) => {
	const selectedNode = useContext(SelectedNodeContext);
	const nodeInspectData = useInspectNodeData(selectedNode?.id ?? null);

	if (!nodeInspectData) {
		return null;
	}

	return (
		<div className={props.className}>
			<div className="p-2">
				<NodeInspectInfo selectedNode={nodeInspectData} />
				{nodeInspectData && (
					<div className="mt-2 flex flex-col gap-2">
						<NodeInspectData inspectData={nodeInspectData} />
					</div>
				)}
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

	const lastInspectedFiberId = usePrevious(nodeId);

	useEffect(() => {
		if (nodeId === null) {
			setNodeInspectData(null);
		} else if (inspectData) {
			const nodeInspectData = inspectData.find((data) => data.id === nodeId);
			setNodeInspectData(nodeInspectData ?? null);
		}
	}, [inspectData, nodeId]);

	useEffect(() => {
		if (lastInspectedFiberId === nodeId) return;

		console.log('Requested', nodeId);
		chromeBridge.send({
			type: ChromeBridgeMessageType.INSPECT_ELEMENT,
			content: nodeId === null ? [] : [nodeId],
		});
	}, [nodeId, chromeBridge, lastInspectedFiberId]);

	return nodeInspectData;
};

