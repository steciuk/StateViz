import { useEffect } from 'react';

export default function App() {
	useEffect(() => {
		console.log('content view loaded');
	}, []);

	return <>content view</>;
}
