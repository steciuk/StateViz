import React, { MouseEvent, useContext, useEffect, useState } from 'react';

import { SelectedNodeUpdateContext } from '@pages/panel/contexts/SelectedNodeContext';
import { Header } from '@pages/panel/sections/Header/Header';
import { InspectWindow } from '@pages/panel/sections/InspectWindow';
import Roots from '@pages/panel/sections/Roots';

export const Panel = () => {
	const updateSelectedFiber = useContext(SelectedNodeUpdateContext);

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
					<Roots />
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

