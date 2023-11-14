import React, { useEffect, useState } from 'react';

import FiberRow from '@pages/panel/components/FiberRow';
import {
	ChromeBridgeConnection,
	ChromeBridgeMessage,
	ChromeBridgeMessageType,
	ChromeBridgeToTabConnector,
} from '@src/shared/chrome-messages/ChromeBridge';
import { ParsedFiber } from '@src/shared/types/ParsedFiber';

const Panel: React.FC = () => {
	const [fiberTree, setFiberTree] = useState<ParsedFiber | null>(null);

	useEffect(() => {
		const chromeBridge = new ChromeBridgeToTabConnector(
			ChromeBridgeConnection.PANEL_TO_CONTENT,
			chrome.devtools.inspectedWindow.tabId
		);
		chromeBridge.connect();
		const removeChromeMessageListener = chromeBridge.onMessage(
			(message: ChromeBridgeMessage) => {
				if (message.type === ChromeBridgeMessageType.FULL_SKELETON) {
					setFiberTree(message.content);
				}
			}
		);

		return () => {
			removeChromeMessageListener();
			chromeBridge.disconnect();
		};
	}, []);

	return (
		<div
			style={{
				backgroundColor: '#1f1f1f',
				color: 'white',
				width: '100%',
				minHeight: '100vh',
			}}
		>
			{fiberTree && <FiberRow fiber={fiberTree} />}
		</div>
	);
};

export default Panel;
