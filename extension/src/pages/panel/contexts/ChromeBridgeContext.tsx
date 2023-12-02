import { createContext, ReactNode, useEffect } from 'react';

import {
	ChromeBridgeConnection,
	ChromeBridgeToTabConnector,
} from '@src/shared/chrome-messages/ChromeBridge';

const chromeBridge = new ChromeBridgeToTabConnector(
	ChromeBridgeConnection.PANEL_TO_CONTENT,
	chrome.devtools.inspectedWindow.tabId,
);

export const ChromeBridgeContext = createContext(chromeBridge);

export const ChromeBridgeProvider = (props: { children: ReactNode }) => {
	// TODO: Should we keep chromeBridge as a state variable?
	// So the dependent components can add again all the listeners?
	// FIXME: reconnect after page reload
	useEffect(() => {
		console.log('Connecting chrome bridge');
		chromeBridge.connect();
		return () => {
			console.log('Disconnecting chrome bridge');
			chromeBridge.disconnect();
		};
	}, []);

	return (
		<ChromeBridgeContext.Provider value={chromeBridge}>
			{props.children}
		</ChromeBridgeContext.Provider>
	);
};
