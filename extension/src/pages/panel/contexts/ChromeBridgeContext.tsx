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

