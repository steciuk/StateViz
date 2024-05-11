import './index.css';

import React from 'react';
import ReactDOM from 'react-dom/client';

import Root1 from './Root1.tsx';
import Root2 from './Root2.tsx';

const root1 = document.getElementById('root-1')!;
const root2 = document.getElementById('root-2')!;

ReactDOM.createRoot(root1).render(
	<React.StrictMode>
		<Root1 />
	</React.StrictMode>
);

ReactDOM.createRoot(root2).render(
	<React.StrictMode>
		<Root2 />
	</React.StrictMode>
);
