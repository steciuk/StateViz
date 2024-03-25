import React, { StrictMode } from 'react';

import { ChromeBridgeProvider } from '@pages/panel/contexts/ChromeBridgeContext';
import { FilterProvider } from '@pages/panel/library-specific/contexts/FilterContext';
import { SelectedNodeProvider } from '@pages/panel/contexts/SelectedNodeContext';
import { Panel } from '@pages/panel/sections/Panel';
import { InspectDataProvider } from '@pages/panel/contexts/NodeInspectDataContext';

const App = () => {
	return (
		<StrictMode>
			<ChromeBridgeProvider>
				<FilterProvider>
					<SelectedNodeProvider>
						<InspectDataProvider>
							<Panel />
						</InspectDataProvider>
					</SelectedNodeProvider>
				</FilterProvider>
			</ChromeBridgeProvider>
		</StrictMode>
	);
};

export default App;

