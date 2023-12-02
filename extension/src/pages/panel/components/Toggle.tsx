import React from 'react';

export const Toggle = (props: {
	value: boolean;
	onChange: (value: boolean) => void;
	label: string;
	type: 'checkbox' | 'radio';
}) => {
	const { value, onChange, label, type } = props;

	return (
		<label className="flex items-center space-x-2">
			<input
				type={type}
				checked={value}
				onChange={(e) => onChange(e.target.checked)}
			/>
			<span>{label}</span>
		</label>
	);
};
