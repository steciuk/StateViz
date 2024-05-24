import {
	createContext,
	ReactNode,
	useCallback,
	useEffect,
	useMemo,
	useState,
} from 'react';

import {
	ChromeBridgeConnection,
	ChromeBridgeMessage,
	ChromeBridgeToTabConnector,
} from '@src/shared/chrome/ChromeBridge';
import { consoleLog } from '@src/shared/utils/console';

const chromeBridge = new ChromeBridgeToTabConnector(
	ChromeBridgeConnection.PANEL_TO_CONTENT,
	chrome.devtools.inspectedWindow.tabId
);

export const ChromeBridgeContext = createContext<{
	sendThroughBridge: ChromeBridgeToTabConnector['send'];
	onBridgeMessage: ChromeBridgeToTabConnector['onMessage'];
	isBridgeConnected: boolean;
}>({
	sendThroughBridge: () => {},
	onBridgeMessage: () => () => {},
	isBridgeConnected: false,
});

export const ChromeBridgeProvider = (props: { children: ReactNode }) => {
	const [isConnected, setIsConnected] = useState(false);

	useEffect(() => {
		consoleLog('Connecting chrome bridge');
		chromeBridge.connect();

		const handlePageReload = () => {
			consoleLog('Reloading page');
			chromeBridge.disconnect();
			chromeBridge.connect();
		};

		chrome.devtools.network.onNavigated.addListener(handlePageReload);

		return () => {
			consoleLog('Disconnecting chrome bridge');
			chromeBridge.disconnect();
			chrome.devtools.network.onNavigated.removeListener(handlePageReload);
		};
	}, []);

	const send = useCallback((message: ChromeBridgeMessage) => {
		try {
			chromeBridge.send(message);
			setIsConnected(true);
		} catch (e) {
			setIsConnected(false);
		}
	}, []);

	const onBridgeMessage = useCallback(
		(callback: (message: ChromeBridgeMessage) => void) => {
			const removeListener = chromeBridge.onMessage((message) => {
				callback(message);
				setIsConnected(true);
			});

			return removeListener;
		},
		[]
	);

	const bridge = useMemo(() => {
		return {
			sendThroughBridge: send,
			onBridgeMessage: onBridgeMessage,
			isBridgeConnected: isConnected,
		};
	}, [send, isConnected, onBridgeMessage]);

	return (
		<ChromeBridgeContext.Provider value={bridge}>
			{props.children}
		</ChromeBridgeContext.Provider>
	);
};

