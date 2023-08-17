import Button from './Button';

const CounterPlus = (props: { onClick: () => void }) => {
	return <Button onClick={props.onClick} text="+" />;
};

export default CounterPlus;
