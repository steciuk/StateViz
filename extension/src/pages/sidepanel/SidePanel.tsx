import '@pages/sidepanel/SidePanel.css';

import React from 'react';

import logo from '@assets/img/logo.svg';
import withErrorBoundary from '@src/shared/hoc/withErrorBoundary';
import withSuspense from '@src/shared/hoc/withSuspense';
import useStorage from '@src/shared/hooks/useStorage';
import themeStorage from '@src/shared/storages/ThemeStorage';

const SidePanel = () => {
	const theme = useStorage(themeStorage);

	return (
		<div
			className="App"
			style={{
				backgroundColor: theme === 'light' ? '#fff' : '#000',
			}}
		>
			<header
				className="App-header"
				style={{ color: theme === 'light' ? '#000' : '#fff' }}
			>
				<img src={logo} className="App-logo" alt="logo" />
				<p>
					Edit <code>src/pages/sidepanel/SidePanel.tsx</code> and save to
					reload.
				</p>
				<a
					className="App-link"
					href="https://reactjs.org"
					target="_blank"
					rel="noopener noreferrer"
					style={{
						color: theme === 'light' ? '#0281dc' : undefined,
						marginBottom: '10px',
					}}
				>
					Learn React!
				</a>
				<button
					style={{
						backgroundColor: theme === 'light' ? '#fff' : '#000',
						color: theme === 'light' ? '#000' : '#fff',
					}}
					onClick={themeStorage.toggle}
				>
					Toggle theme
				</button>
			</header>
		</div>
	);
};

export default withErrorBoundary(
	withSuspense(SidePanel, <div> Loading ... </div>),
	<div> Error Occur </div>
);

