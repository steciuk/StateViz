import React, { StrictMode } from 'react';

import { FilterProvider } from '@pages/panel/contexts/FilterContext';
import { SelectedFiberProvider } from '@pages/panel/contexts/SelectedFiberContext';
import Panel from '@pages/panel/pages/Panel/Panel';

const App = () => {
	return (
		<StrictMode>
			<FilterProvider>
				<SelectedFiberProvider>
					<Panel />
				</SelectedFiberProvider>
			</FilterProvider>
		</StrictMode>
	);
};

export default App;
