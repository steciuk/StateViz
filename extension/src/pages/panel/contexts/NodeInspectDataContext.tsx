import { createContext, useContext, useEffect, useState } from 'react';

import { ChromeBridgeContext } from '@pages/panel/contexts/ChromeBridgeContext';
import {
	ChromeBridgeMessage,
	ChromeBridgeMessageType,
} from '@src/shared/chrome-messages/ChromeBridge';
import { NodeInspectedData } from '@src/shared/types/NodeInspectedData';

export const InspectDataContext = createContext<NodeInspectedData[] | null>(
	null
);

export const InspectDataProvider = (props: { children: React.ReactNode }) => {
	const [inspectData, setInspectData] = useState<NodeInspectedData[] | null>(
		null
	);
	const chromeBridge = useContext(ChromeBridgeContext);

	useEffect(() => {
		const removeChromeMessageListener = chromeBridge.onMessage(
			(message: ChromeBridgeMessage) => {
				if (message.type === ChromeBridgeMessageType.INSPECTED_DATA) {
					console.log('Set node inspect data');
					setInspectData(message.content);
				}
			}
		);

		return () => {
			removeChromeMessageListener();
		};
	}, [chromeBridge]);

	return (
		<InspectDataContext.Provider value={inspectData}>
			{props.children}
		</InspectDataContext.Provider>
	);
};

