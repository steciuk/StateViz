import React, { StrictMode } from 'react';

import { ChromeBridgeProvider } from '@pages/panel/contexts/ChromeBridgeContext';
import { FilterProvider } from '@pages/panel/library-specific/contexts/FilterContext';
import { SelectedNodeProvider } from '@pages/panel/contexts/SelectedNodeContext';
import { Panel } from '@pages/panel/sections/Panel';
import { InspectDataProvider } from '@pages/panel/contexts/NodeInspectDataContext';
import { ExpandProvider } from '@pages/panel/contexts/ExpandContext';

const App = () => {
	return (
		<StrictMode>
			<ChromeBridgeProvider>
				<FilterProvider>
					<SelectedNodeProvider>
						<InspectDataProvider>
							<ExpandProvider>
								<Panel />
							</ExpandProvider>
						</InspectDataProvider>
					</SelectedNodeProvider>
				</FilterProvider>
			</ChromeBridgeProvider>
		</StrictMode>
	);
};

export default App;

