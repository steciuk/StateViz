import React, { useEffect, useState } from 'react';

import FiberRow from '@pages/panel/components/FiberRow';
import {
	ChromeMessage,
	ChromeMessageType,
} from '@src/shared/chrome-message/events';
import { onChromeMessage } from '@src/shared/chrome-message/message';
import { ParsedFiber } from '@src/shared/types/ParsedFiber';

const Panel: React.FC = () => {
	const [fiberTree, setFiberTree] = useState<ParsedFiber | null>(null);

	useEffect(() => {
		const removeChromeMessageListener = onChromeMessage(
			(message: ChromeMessage) => {
				console.log('message', message);
				if (message.type === ChromeMessageType.COMMIT_ROOT) {
					setFiberTree(message.content);
				}
			}
		);
		return () => {
			removeChromeMessageListener();
		};
	}, []);

	return (
		<div
			style={{
				backgroundColor: '#1f1f1f',
				color: 'white',
				width: '100%',
				height: '100vh',
			}}
		>
			{fiberTree && <FiberRow fiber={fiberTree} />}
		</div>
	);
};

export default Panel;
