import React, { StrictMode } from 'react';

import { ChromeBridgeProvider } from '@pages/panel/contexts/ChromeBridgeContext';
import { FilterProvider } from '@pages/panel/contexts/FilterContext';
import { SelectedFiberProvider } from '@pages/panel/contexts/SelectedFiberContext';
import { Panel } from '@pages/panel/pages/Panel/Panel';

const App = () => {
	return (
		<StrictMode>
			<ChromeBridgeProvider>
				<FilterProvider>
					<SelectedFiberProvider>
						<Panel />
					</SelectedFiberProvider>
				</FilterProvider>
			</ChromeBridgeProvider>
		</StrictMode>
	);
};

export default App;
