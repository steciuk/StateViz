import React from 'react';

import { FilterProvider } from '@pages/panel/contexts/FilterContext';
import Panel from '@pages/panel/pages/Panel';

const App = () => {
	return (
		<FilterProvider>
			<Panel />
		</FilterProvider>
	);
};

export default App;
