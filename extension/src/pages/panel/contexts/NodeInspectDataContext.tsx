import { createContext, useContext, useEffect, useState } from 'react';

import { ChromeBridgeContext } from '@pages/panel/contexts/ChromeBridgeContext';
import {
	ChromeBridgeMessage,
	ChromeBridgeMessageType,
} from '@src/shared/chrome/ChromeBridge';
import { NodeInspectedData } from '@src/shared/types/NodeInspectedData';

export const InspectDataContext = createContext<NodeInspectedData[] | null>(
	null
);

export const InspectDataProvider = (props: { children: React.ReactNode }) => {
	const [inspectData, setInspectData] = useState<NodeInspectedData[] | null>(
		null
	);
	const { onBridgeMessage } = useContext(ChromeBridgeContext);

	useEffect(() => {
		const removeChromeMessageListener = onBridgeMessage(
			(message: ChromeBridgeMessage) => {
				if (message.type === ChromeBridgeMessageType.INSPECTED_DATA) {
					setInspectData(message.content);
				}
			}
		);

		return () => {
			removeChromeMessageListener();
		};
	}, [onBridgeMessage]);

	return (
		<InspectDataContext.Provider value={inspectData}>
			{props.children}
		</InspectDataContext.Provider>
	);
};

