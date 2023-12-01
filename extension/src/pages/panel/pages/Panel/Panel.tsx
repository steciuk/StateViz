import React, { MouseEvent, useContext, useEffect, useState } from 'react';

import { ChromeBridgeContext } from '@pages/panel/contexts/ChromeBridgeContext';
import {
	SelectedFiberContext,
	SelectedFiberUpdateContext,
} from '@pages/panel/contexts/SelectedFiberContext';
import { FiberRow } from '@pages/panel/pages/Panel/FiberRow/FiberRow';
import { Header } from '@pages/panel/pages/Panel/Header/Header';
import InspectWindow from '@pages/panel/pages/Panel/InspectWindow';
import {
	ChromeBridgeMessage,
	ChromeBridgeMessageType,
} from '@src/shared/chrome-messages/ChromeBridge';
import { ParsedFiber } from '@src/shared/types/ParsedFiber';

export const Panel = () => {
	const selectedFiber = useContext(SelectedFiberContext);
	const updateSelectedFiber = useContext(SelectedFiberUpdateContext);
	const fiberRoot = useFiberRoot();

	const deselectFiber = (e: MouseEvent<HTMLElement>) => {
		e.stopPropagation();
		updateSelectedFiber(null);
	};

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

const useFiberRoot = () => {
	const chromeBridge = useContext(ChromeBridgeContext);
	const [fiberRoot, setFiberRoot] = useState<ParsedFiber[] | null>(null);

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
