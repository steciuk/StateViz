import Button from './Button';

const CounterMinus = (props: { onClick: () => void }) => {
	return <Button onClick={props.onClick} text="-" />;
};

export default CounterMinus;
