import React, { MouseEvent, useContext, useEffect, useState } from 'react';

import { ChromeBridgeContext } from '@pages/panel/contexts/ChromeBridgeContext';
import { SelectedNodeUpdateContext } from '@pages/panel/contexts/SelectedNodeContext';
import { Header } from '@pages/panel/sections/Header/Header';
import { InspectWindow } from '@pages/panel/sections/InspectWindow';
import {
	ChromeBridgeMessage,
	ChromeBridgeMessageType,
} from '@src/shared/chrome-messages/ChromeBridge';
import { NodeAndLibrary } from '@src/shared/types/ParsedNode';
import Roots from '@pages/panel/sections/Roots';

export const Panel = () => {
	const updateSelectedFiber = useContext(SelectedNodeUpdateContext);
	const roots = useRoots();

	const deselectFiber = (e: MouseEvent<HTMLElement>) => {
		e.stopPropagation();
		updateSelectedFiber(null);
	};

	useDeselectFiberOnPageReload();

	return (
		<div className="flex h-screen flex-col bg-background text-text">
			<Header />
			<main className="flex h-0 flex-grow">
				<div className="flex-grow overflow-auto" onClick={deselectFiber}>
					{roots && <Roots roots={roots} />}
				</div>
				<InspectWindow className="w-48 flex-shrink-0 border-l-2 border-secondary" />
			</main>
		</div>
	);
};

const useDeselectFiberOnPageReload = () => {
	const updateSelectedFiber = useContext(SelectedNodeUpdateContext);

	useEffect(() => {
		const deselectFiberOnPageReload = () => {
			updateSelectedFiber(null);
		};

		chrome.devtools.network.onNavigated.addListener(deselectFiberOnPageReload);

		return () => {
			chrome.devtools.network.onNavigated.removeListener(
				deselectFiberOnPageReload
			);
		};
	}, [updateSelectedFiber]);
};

const useRoots = () => {
	const chromeBridge = useContext(ChromeBridgeContext);
	const [fiberRoot, setFiberRoot] = useState<NodeAndLibrary[] | null>(null);

	useEffect(() => {
		const removeChromeMessageListener = chromeBridge.onMessage(
			(message: ChromeBridgeMessage) => {
				if (message.type === ChromeBridgeMessageType.FULL_SKELETON) {
					console.log('Set fiber root');
					setFiberRoot(message.content);
				}
			}
		);

		return () => {
			removeChromeMessageListener();
		};
	}, [chromeBridge]);

	return fiberRoot;
};

