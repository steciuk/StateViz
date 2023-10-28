import '@pages/panel/Panel.css';

import React, { useEffect, useState } from 'react';

type Message = {
	source: string;
	text: string;
};

const Panel: React.FC = () => {
	const [messages, setMessages] = useState<Message[]>([]);

	useEffect(() => {
		chrome.runtime.onConnect.addListener((port) => {
			console.log('panel connect');
			console.log(port);
			port.onMessage.addListener((message) => {
				console.log('panel message', message);
				setMessages((prev) => [...prev, message]);
			});
			port.onDisconnect.addListener(() => {
				console.log('panel disconnect');
			});
		});

		// const port = chrome.runtime.connect({ name: 'panel' });
		// port.onMessage.addListener((message) => {
		// 	console.log('panel message', message);
		// 	setMessages((prev) => [...prev, message]);
		// });
	}, []);

	return (
		<div className="container">
			<h1 className="text-lime-400">Dev Tools Panel</h1>
			<ul>
				{messages.map((message, index) => (
					<li key={index}>
						<div>{message.source}</div>
						<div>{message.text}</div>
					</li>
				))}
			</ul>
		</div>
	);
};

export default Panel;
