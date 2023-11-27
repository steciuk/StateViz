import { useCallback, useState } from 'react';

import CounterDisplay from './components/CounterDisplay';
import CounterMinus from './components/CounterMinus';
import CounterPlus from './components/CounterPlus';

function App() {
	const [count, setCount] = useState(0);

	const increment = useCallback(() => {
		setCount((count) => count + 1);
	}, []);

	const decrement = useCallback(() => {
		setCount((count) => count - 1);
	}, []);

	return (
		<>
			<div
				style={{
					display: 'flex',
				}}
			>
				<CounterMinus onClick={decrement} />
				<CounterPlus onClick={increment} />
			</div>
			<div
				style={{
					display: 'flex',
				}}
			>
				<CounterDisplay count={count} counterName="Counter 1" />
				<CounterDisplay count={count} counterName="Counter 2" />
			</div>
		</>
	);
}

export default App;
