import { consoleLog } from '@src/shared/utils/console';
import { useEffect } from 'react';

export default function App() {
	useEffect(() => {
		consoleLog('content view loaded');
	}, []);

	return <>content view</>;
}

