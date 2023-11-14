const Button = (props: { onClick: () => void; text: string }) => {
	return <button onClick={props.onClick}>{props.text}</button>;
};

export default Button;
