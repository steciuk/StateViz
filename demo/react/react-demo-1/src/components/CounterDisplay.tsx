const CounterDisplay = (props: { count: number; counterName: string }) => {
	return (
		<div
			style={{
				border: '1px solid black',
				padding: '10px',
				margin: '10px',
			}}
		>
			<p>{props.counterName}</p>
			<p>Counter: {props.count}</p>
		</div>
	);
};

export default CounterDisplay;
