import React, { StrictMode } from 'react';

import { FilterProvider } from '@pages/panel/contexts/FilterContext';
import Panel from '@pages/panel/pages/Panel/Panel';

const App = () => {
	return (
		<StrictMode>
			<FilterProvider>
				<Panel />
			</FilterProvider>
		</StrictMode>
	);
};

export default App;
