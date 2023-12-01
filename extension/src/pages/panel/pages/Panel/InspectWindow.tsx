import React, { useContext, useEffect, useState } from 'react';

import { ChromeBridgeContext } from '@pages/panel/contexts/ChromeBridgeContext';
import { getWorkTagLabel } from '@pages/panel/utils/work-tag';
import {
	ChromeBridgeMessage,
	ChromeBridgeMessageType,
	InspectedDataMessageContent,
} from '@src/shared/chrome-messages/ChromeBridge';
import { ParsedFiber } from '@src/shared/types/ParsedFiber';

export const InspectWindow = (props: { fiber: ParsedFiber }) => {
	const { fiber } = props;
	const chromeBridge = useContext(ChromeBridgeContext);
	const nodeInspectData = useNodeInspectData();

	useEffect(() => {
		chromeBridge.send({
			type: ChromeBridgeMessageType.INSPECT_ELEMENT,
			content: fiber.id,
		});
	}, [fiber, chromeBridge]);

	return (
		<div className="p-2">
			<h2 className="text-lg">Inspect window</h2>
			<p>Name: {fiber.name}</p>
			<p>Tag: {fiber.tag}</p>
			<p>Type: {getWorkTagLabel(fiber.tag)}</p>
			<p>ID: {fiber.id}</p>
			{nodeInspectData && (
				<p>State: {nodeInspectData[0].data.state as string}</p>
			)}
		</div>
	);
};

const useNodeInspectData = () => {
	const chromeBridge = useContext(ChromeBridgeContext);
	const [nodeInspectData, setNodeInspectData] =
		useState<InspectedDataMessageContent | null>(null);

	useEffect(() => {
		const removeChromeMessageListener = chromeBridge.onMessage(
			(message: ChromeBridgeMessage) => {
				if (message.type === ChromeBridgeMessageType.INSPECTED_DATA) {
					console.log('Set node inspect data');
					setNodeInspectData(message.content);
				}
			},
		);

		return () => {
			removeChromeMessageListener();
		};
	}, [chromeBridge]);

	return nodeInspectData;
};
