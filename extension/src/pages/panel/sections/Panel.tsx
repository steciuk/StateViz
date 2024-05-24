import React, { MouseEvent, useContext, useEffect } from 'react';

import { SelectedNodeUpdateContext } from '@pages/panel/contexts/SelectedNodeContext';
import { Header } from '@pages/panel/sections/Header/Header';
import { InspectWindow } from '@pages/panel/sections/InspectWindow';
import Roots from '@pages/panel/sections/Roots';
import { SplitView } from '@pages/panel/components/SplitView';

export const Panel = () => {
	const updateSelectedFiber = useContext(SelectedNodeUpdateContext);

	const deselectFiber = (e: MouseEvent<HTMLElement>) => {
		e.stopPropagation();
		updateSelectedFiber(null);
	};

	return (
		<div className="flex h-screen flex-col bg-background text-text">
			<Header />
			<main className="flex h-0 w-full flex-grow">
				<SplitView
					left={
						<div className="flex h-full" onClick={deselectFiber}>
							<Roots />
						</div>
					}
					right={<InspectWindow className="h-full min-w-max" />}
				/>
			</main>
		</div>
	);
};

