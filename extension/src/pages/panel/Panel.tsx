import '@pages/panel/Panel.css';

import React, { useEffect } from 'react';

import { ChromeMessage } from '@src/shared/chrome-message/events';
import { onChromeMessage } from '@src/shared/chrome-message/message';

const Panel: React.FC = () => {
	useEffect(() => {
		const onMessageCallback = (message: ChromeMessage) => {
			console.log(message);
		};

		// TODO: why if this is used the sender doesn't see the target?
		onChromeMessage(onMessageCallback);
		// but if this, everything works fine
		// chrome.runtime.onMessage.addListener(onMessageCallback);

		return () => {
			// offChromeMessage(onMessageCallback);
		};
	}, []);

	return (
		<div className="container">
			<h1 className="text-lime-400">Dev Tools Panel</h1>
		</div>
	);
};

export default Panel;
