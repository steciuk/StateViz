import '@pages/popup/index.css';
import '@src/shared/style/twind.css';

import React from 'react';
import { createRoot } from 'react-dom/client';
import refreshOnUpdate from 'virtual:reload-on-update-in-view';

import Popup from '@pages/popup/Popup';
import { attachTwindStyle } from '@src/shared/style/twind';

refreshOnUpdate('pages/popup');

function init() {
	const appContainer = document.querySelector('#app-container');
	if (!appContainer) {
		throw new Error('Can not find #app-container');
	}
	attachTwindStyle(appContainer, document);
	const root = createRoot(appContainer);
	root.render(<Popup />);
}

init();

