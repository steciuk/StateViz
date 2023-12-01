import React, { MouseEvent, useContext, useEffect, useState } from 'react';

import {
	SelectedFiberContext,
	SelectedFiberUpdateContext,
} from '@pages/panel/contexts/SelectedFiberContext';
import { FiberRow } from '@pages/panel/pages/Panel/FiberRow/FiberRow';
import { Header } from '@pages/panel/pages/Panel/Header/Header';
import InspectWindow from '@pages/panel/pages/Panel/InspectWindow';
import {
	ChromeBridgeConnection,
	ChromeBridgeMessage,
	ChromeBridgeMessageType,
	ChromeBridgeToTabConnector,
} from '@src/shared/chrome-messages/ChromeBridge';
import { ParsedFiber } from '@src/shared/types/ParsedFiber';

const Panel = () => {
	const selectedFiber = useContext(SelectedFiberContext);
	const updateSelectedFiber = useContext(SelectedFiberUpdateContext);

	const [fiberRoot, setFiberRoot] = useState<ParsedFiber[] | null>(null);

	const deselectFiber = (e: MouseEvent<HTMLElement>) => {
		e.stopPropagation();
		updateSelectedFiber(null);
	};

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
		<div className="text-text bg-background h-screen flex flex-col">
			<Header />
			<main className="flex-grow flex h-0">
				<div className="flex-grow overflow-auto" onClick={deselectFiber}>
					{fiberRoot &&
						fiberRoot.map((fiber) => (
							<FiberRow key={fiber.id} fiber={fiber} indent={0} />
						))}
				</div>
				{selectedFiber && (
					<div className="border-l-2 border-secondary w-48 flex-shrink-0">
						<InspectWindow fiber={selectedFiber} />
					</div>
				)}
			</main>
		</div>
	);
};

export default Panel;
