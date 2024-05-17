import { createContext, ReactNode, useEffect } from 'react';

import {
	ChromeBridgeConnection,
	ChromeBridgeToTabConnector,
} from '@src/shared/chrome/ChromeBridge';

const chromeBridge = new ChromeBridgeToTabConnector(
	ChromeBridgeConnection.PANEL_TO_CONTENT,
	chrome.devtools.inspectedWindow.tabId
);

export const ChromeBridgeContext = createContext(
	null as unknown as ChromeBridgeToTabConnector
);

export const ChromeBridgeProvider = (props: { children: ReactNode }) => {
	useEffect(() => {
		console.log('Connecting chrome bridge');
		chromeBridge.connect();

		const handlePageReload = () => {
			console.log('Reloading page');
			chromeBridge.disconnect();
			chromeBridge.connect();
		};

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

