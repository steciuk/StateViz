import React, { useEffect, useState } from 'react';

import { FiberRow } from '@pages/panel/pages/Panel/FiberRow';
import { Header } from '@pages/panel/pages/Panel/Header/Header';
import {
	ChromeBridgeConnection,
	ChromeBridgeMessage,
	ChromeBridgeMessageType,
	ChromeBridgeToTabConnector,
} from '@src/shared/chrome-messages/ChromeBridge';
import { ParsedFiber } from '@src/shared/types/ParsedFiber';

const Panel = () => {
	const [fiberRoot, setFiberRoot] = useState<ParsedFiber[] | null>(null);

	useEffect(() => {
		const chromeBridge = new ChromeBridgeToTabConnector(
			ChromeBridgeConnection.PANEL_TO_CONTENT,
			chrome.devtools.inspectedWindow.tabId
		);
		chromeBridge.connect();
		const removeChromeMessageListener = chromeBridge.onMessage(
			(message: ChromeBridgeMessage) => {
				if (message.type === ChromeBridgeMessageType.FULL_SKELETON) {
					setFiberRoot(message.content);
				}
			}
		);

		// FIXME: refresh connection if page is reloaded

		return () => {
			removeChromeMessageListener();
			chromeBridge.disconnect();
		};
	}, []);

	return (
		<div className="text-text bg-background h-screen">
			<Header />
			<main>
				{fiberRoot &&
					fiberRoot.map((fiber) => <FiberRow key={fiber.id} fiber={fiber} />)}
			</main>
		</div>
	);
};

export default Panel;
