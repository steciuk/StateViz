import React, { MouseEvent, useContext, useEffect, useState } from 'react';

import { ChromeBridgeContext } from '@pages/panel/contexts/ChromeBridgeContext';
import { SelectedFiberUpdateContext } from '@pages/panel/contexts/SelectedFiberContext';
import { FiberRow } from '@pages/panel/pages/Panel/FiberRow/FiberRow';
import { Header } from '@pages/panel/pages/Panel/Header/Header';
import { InspectWindow } from '@pages/panel/pages/Panel/InspectWindow';
import {
	ChromeBridgeMessage,
	ChromeBridgeMessageType,
} from '@src/shared/chrome-messages/ChromeBridge';
import { ParsedReactNode, Root } from '@src/shared/types/ParsedNode';
import { Library } from '@src/shared/types/Library';
import { SvelteRow } from './FiberRow/SvelteRow';

export const Panel = () => {
	const updateSelectedFiber = useContext(SelectedFiberUpdateContext);
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
					{roots &&
						roots.map((root) => (
              <div key={root.root.id}>
              <p>{root.library}</p>
              {root.library === Library.REACT
              ? <FiberRow fiber={root.root} indent={0} /> 
              : <SvelteRow fiber={root.root} indent={0}/> }
							
              </div>
						))}
				</div>
				<InspectWindow className="w-48 flex-shrink-0 border-l-2 border-secondary" />
			</main>
		</div>
	);
};

const useDeselectFiberOnPageReload = () => {
	const updateSelectedFiber = useContext(SelectedFiberUpdateContext);

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
	const [fiberRoot, setFiberRoot] = useState<Root[] | null>(null);

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
