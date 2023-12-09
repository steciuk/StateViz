import { createContext, ReactNode, useEffect } from 'react';

import {
	ChromeBridgeConnection,
	ChromeBridgeToTabConnector,
} from '@src/shared/chrome-messages/ChromeBridge';

const chromeBridge = new ChromeBridgeToTabConnector(
	ChromeBridgeConnection.PANEL_TO_CONTENT,
	chrome.devtools.inspectedWindow.tabId
);

export const ChromeBridgeContext = createContext(chromeBridge);

export const ChromeBridgeProvider = (props: { children: ReactNode }) => {
	// TODO: Should we keep chromeBridge as a state variable?
	// So the dependent components can add again all the listeners?
	useEffect(() => {
		console.log('Connecting chrome bridge');
		chromeBridge.connect();

		const handlePageReload = () => {
			console.log('Reloading page');
			chromeBridge.disconnect();
			chromeBridge.connect();
		};

		// TODO: check if in app navigation does not trigger this event
		chrome.devtools.network.onNavigated.addListener(handlePageReload);

		return () => {
			console.log('Disconnecting chrome bridge');
			chromeBridge.disconnect();
			chrome.devtools.network.onNavigated.removeListener(handlePageReload);
		};
	}, []);

	return (
		<ChromeBridgeContext.Provider value={chromeBridge}>
			{props.children}
		</ChromeBridgeContext.Provider>
	);
};
